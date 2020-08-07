const Twitter = require('twitter')
const createFractal = require('../createFractal')
const randomFractalRequest = require('../lib/fractals').randomFractalRequest

// Twitter authentication parameters are secret, should be set as app settings
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || null
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || null
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || null
const TWITTER_TOKEN_SECRET = process.env.TWITTER_TOKEN_SECRET || null

const FUNCTION_APP_NAME = process.env.APPSETTING_WEBSITE_SITE_NAME || "fractal-bot"

// Default fractal size, seems ok
const FRACTAL_WIDTH = 1280
const FRACTAL_HEIGHT = 768
const QUALITY_THRESHOLD = 10

//
// Generate a random fractal, then send it to Twitter as a tweet
//
module.exports = async function (context, fractalTimer) {
  try {
    // Belt and braces check on required Twitter auth params
    if(!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_TOKEN_SECRET) {
      context.log(`### ERROR: One or more Twitter API auth parameters missing! Env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_TOKEN_SECRET must all be set. Aborting now`)
      context.done()
      return
    }

    let fractalCtx
    let fractalRequest
    for(let c = 1; c <= 5; c++) {
      fractalCtx = {}  
      // Get randomized fractal parameters
      fractalRequest = randomFractalRequest(FRACTAL_WIDTH, FRACTAL_HEIGHT)
  
      // Call createFractal with our request & empty context
      // Note. This is calling another top level Function, we pretend it's the HTTP trigger request
      await createFractal(fractalCtx, fractalRequest)
  
      // Rough measure of "quality" of fractal is based on number of iterations
      let totalIter = fractalCtx.res.headers['Fractal-Iters']
      let quality = totalIter / (fractalRequest.query.w * fractalRequest.query.h)
   
      if(quality > QUALITY_THRESHOLD) {
        context.log(`### ACCEPTING FRACTAL: ${quality}`)
        break
      } else {
        context.log(`### REJECTING FRACTAL: ${quality} RETRYING...`)
      }
    }

    // Form fractal URL, just for putting into the tweet text
    var queryString = Object.keys(fractalRequest.query).map(key => key + '=' + fractalRequest.query[key]).join('&')
    var fractalUrl = `https://${FUNCTION_APP_NAME}.azurewebsites.net/api/createFractal?${queryString}`
    context.log(`### fractalUrl: ${fractalUrl}`)
    
    // Twitter client API connection
    const client = new Twitter({
      consumer_key: TWITTER_API_KEY,
      consumer_secret: TWITTER_API_SECRET,
      access_token_key: TWITTER_ACCESS_TOKEN,
      access_token_secret: TWITTER_TOKEN_SECRET
    })

    // Upload the image using the body of the context from createFractal, note this is a binary Buffer
    let mediaResp = await client.post('media/upload', { media: fractalCtx.res.body })

    // Format the tweet message text
    let statusMsg
    if(fractalRequest.query.type === 'mandelbrot') {
      statusMsg = `mandelbrot(r=${fractalRequest.query.r.toFixed(4)}, i=${fractalRequest.query.i.toFixed(4)}, zoom=${fractalRequest.query.zoom.toFixed(4)})`
    } else {
      statusMsg = `julia(seedR=${fractalRequest.query.r.toFixed(4)}, seedR=${fractalRequest.query.i.toFixed(4)}, zoom=${fractalRequest.query.zoom.toFixed(4)})`
    }
    statusMsg += `\n${fractalUrl}`

    // Now send the tweet, attaching the media_id from the image upload
    let twitterResp = await client.post('statuses/update', {
      status: statusMsg,
      media_ids: mediaResp.media_id_string
    })

    context.log(`### Tweet sent: ${twitterResp.id}\n${twitterResp.text}`)
    context.done()
  } catch(err) {
    context.log(`### ERROR: ${err} ${JSON.stringify(err)}`)
    return
  }
}