const randomFractalRequest = require('../lib/fractals').randomFractalRequest
const createFractal = require('../createFractal')

const QUALITY_THRESHOLD = 10

//
// Render a randomly generated fractal and return it as a PNG
//
module.exports = async function (context, req) {

  let fractalCtx
  for(let c = 1; c <= 5; c++) {
    fractalCtx = {}  
    // Get randomized fractal parameters
    let fractalRequest = randomFractalRequest(req.query.w || 500, req.query.w || 500)

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

  // This is a pass-through function, and returns the context which has the PNG body etc
  // see createFractal for details :)
  context.res = fractalCtx.res
};