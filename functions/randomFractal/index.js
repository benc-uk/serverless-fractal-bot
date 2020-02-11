const randomFractalRequest = require('../lib/fractals').randomFractalRequest
const createFractal = require('../createFractal')

module.exports = async function (context, req) {
  context.log('JavaScript HTTP trigger function processed a request.');

  let request = await randomFractalRequest(300, 300)

  // Call createFractal with our request & empty context
  let fractalCtx = {}
  await createFractal(fractalCtx, request)

  context.res = fractalCtx.res
};