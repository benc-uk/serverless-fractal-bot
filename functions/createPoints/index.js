const fs = require('fs')
const iterateMandlebrot = require('../lib/fractals').iterateMandlebrot

module.exports = async function (context, req) {
  // Parse parameters
  const maxiters =   parseInt(req.query.iters || 100.0)
  const zoom =       parseFloat(req.query.zoom || 0.45)
  const centerI =    parseFloat(req.query.i || 0)
  const centerR =    parseFloat(req.query.r || -0.6)
  const width =      parseInt(req.query.w || 600)
  const height =     parseInt(req.query.h || 400)
  const threshold =  parseInt(req.query.threshold || 80)
  const ratio = width / height

  let r, i
  const points = []

  // Generate points
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {

      // Convert x,y pixel space to r,i complex plane
      r = centerR + ((x - width/2) / width) / zoom * ratio
      i = centerI + ((y - height/2) / height) / zoom

      let iterations = 0

      // Actual fractal calculations here
      iterations = iterateMandlebrot(r, i, maxiters)

      // Interesting points
      if (iterations != maxiters) {
        // Outside the set
        const l = (iterations / (maxiters-1)) * 100
        if(l > threshold) points.push({r, i})
      }
    }
  }

  fs.writeFileSync('./points.json', JSON.stringify(points))

  context.res = {
    body: `Done! Points array: ${points.length} elements`
  }
}