const randomFractalRequest = require('../lib/fractals').randomFractalRequest
const createFractal = require('../createFractal')

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  let request = await randomFractalRequest(req.query.w || 500, req.query.w || 500)

  // Call createFractal with our request & empty context
  // !Note! This is calling another top level Function, we cheat and pretend we're a HTTP trigger request
  let fractalCtx = {}
  await createFractal(fractalCtx, request)

  context.res = fractalCtx.res
};