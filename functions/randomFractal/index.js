const fs = require('fs')
const Twitter = require('twitter')

const FUNCTION_APP_NAME = process.env.APPSETTING_WEBSITE_SITE_NAME || "fractals"
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || ""
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || ""
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || ""
const TWITTER_TOKEN_SECRET = process.env.TWITTER_TOKEN_SECRET || ""
const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 768

module.exports = async function (context, fractalTimer) {
  // Load points file and pick a random one
  points = JSON.parse( fs.readFileSync('points.json') )
  let point = points[Math.floor(Math.random() * points.length)]

  try {
    const createFractal = require('../createFractal')

    // Randomly pick deep or shallow zoom
    zoomDepth =  Math.random() > 0.5 ? 20 : 500
    
    // Create a fake request object with query params
    let fractalRequest = {
      query: {
        w: DEFAULT_WIDTH, //parseInt(req.query.w || DEFAULT_WIDTH),
        h: DEFAULT_HEIGHT, //parseInt(req.query.h || DEFAULT_HEIGHT),
        zoom: 3 + Math.random() * zoomDepth,
        bright: 70 + Math.random() * 40,
        hue: Math.random() * 255,
        iter: 50 + Math.random() * 100,
        r: point.r,
        i: point.i,
        hueLoops: Math.random() * 4,
        innerBright: Math.random() * 50
      }
    }

    // Call createFractal with our request & empty context
    let fractalCtx = {}
    await createFractal(fractalCtx, fractalRequest)
    
    var queryString = Object.keys(fractalRequest.query).map(key => key + '=' + fractalRequest.query[key]).join('&');
    var fractalUrl = `https://${FUNCTION_APP_NAME}.azurewebsites.net/api/createFractal?${queryString}`
    context.log(`### fractalUrl: ${fractalUrl}`);
    
    const client = new Twitter({
      consumer_key: TWITTER_API_KEY,
      consumer_secret: TWITTER_API_SECRET,
      access_token_key: TWITTER_ACCESS_TOKEN,
      access_token_secret: TWITTER_TOKEN_SECRET
    });

    if(TWITTER_API_KEY) {
      let mediaResp = await client.post('media/upload', { media: fractalCtx.res.body })
      let twitterResp = await client.post('statuses/update', {
        status: `Mandelbrot(r=${fractalRequest.query.r.toFixed(4)}, i=${fractalRequest.query.i.toFixed(4)}, zoom=${fractalRequest.query.zoom.toFixed(4)})\n${fractalUrl}`, 
        media_ids: mediaResp.media_id_string
      })
      context.log(`### Tweet sent: ${twitterResp.id}\n${twitterResp.text}`);
    }

    context.done() //res = fractalCtx.res
  } catch(err) {
    context.log(`### ERROR: ${err} ${JSON.stringify(err)}`)
    return
  }
};