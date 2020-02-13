const randomFractalRequest = require('../lib/fractals').randomFractalRequest
const createFractal = require('../createFractal')

//
// Render a randomly generated fractal and return it as a PNG
//
module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  let request = await randomFractalRequest(req.query.w || 500, req.query.w || 500)

  // Call createFractal with our request & empty context
  // !Note! This is calling another top level Function, we cheat and pretend we're a HTTP trigger request
  let fractalCtx = {}
  await createFractal(fractalCtx, request)

  // We're a passthrough and return the context which has the PNG body etc
  // see createFractal for details :)
  context.res = fractalCtx.res
};