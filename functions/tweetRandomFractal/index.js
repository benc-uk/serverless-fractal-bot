const Twitter = require('twitter')
const createFractal = require('../createFractal')
const randomFractalRequest = require('../lib/fractals').randomFractalRequest

const FUNCTION_APP_NAME = process.env.APPSETTING_WEBSITE_SITE_NAME || "fractals"
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || null
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || null
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || null
const TWITTER_TOKEN_SECRET = process.env.TWITTER_TOKEN_SECRET || null

const FRACTAL_WIDTH = 1280
const FRACTAL_HEIGHT = 768

module.exports = async function (context, fractalTimer) {
  try {
    if(!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_TOKEN_SECRET) {
      context.log(`### ERROR: One or more Twitter API auth parameters missing! Env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_TOKEN_SECRET must all be set. Aborting now`)
      context.done()
      return
    }

    // Get randomized fractal parameters
    let fractalRequest = await randomFractalRequest(FRACTAL_WIDTH, FRACTAL_HEIGHT)

    // Call createFractal with our request & empty context
    // !Note! This is calling another top level Function, we cheat and pretend we're a HTTP trigger request
    let fractalCtx = {}
    await createFractal(fractalCtx, fractalRequest)
    
    // Form fractal URL, just for putting into the tweet text
    var queryString = Object.keys(fractalRequest.query).map(key => key + '=' + fractalRequest.query[key]).join('&')
    var fractalUrl = `https://${FUNCTION_APP_NAME}.azurewebsites.net/api/createFractal?${queryString}`
    context.log(`### fractalUrl: ${fractalUrl}`)
    
    // Twitter API auth
    const client = new Twitter({
      consumer_key: TWITTER_API_KEY,
      consumer_secret: TWITTER_API_SECRET,
      access_token_key: TWITTER_ACCESS_TOKEN,
      access_token_secret: TWITTER_TOKEN_SECRET
    })

    // Upload the image using the body of the context from createFractal, note this is a binary Buffer
    let mediaResp = await client.post('media/upload', { media: fractalCtx.res.body })

    let status
    if(fractalRequest.query.type === 'mandelbrot') {
      status = `mandelbrot(r=${fractalRequest.query.r.toFixed(4)}, i=${fractalRequest.query.i.toFixed(4)}, zoom=${fractalRequest.query.zoom.toFixed(4)})`
    } else {
      status = `julia(seedR=${fractalRequest.query.r.toFixed(4)}, seedR=${fractalRequest.query.i.toFixed(4)}, zoom=${fractalRequest.query.zoom.toFixed(4)})`
    }
    status += `\n${fractalUrl}`

    // Now send the tweet, attaching the media_id from the image upload
    let twitterResp = await client.post('statuses/update', {
      status: status,
      media_ids: mediaResp.media_id_string
    })

    context.log(`### Tweet sent: ${twitterResp.id}\n${twitterResp.text}`)
    context.done()
  } catch(err) {
    context.log(`### ERROR: ${err} ${JSON.stringify(err)}`)
    return
  }
}