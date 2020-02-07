const fs = require('fs')
const iterateMandlebrot = require('../lib/fractals').iterateMandlebrot

module.exports = async function (context, req) {
  // Parse parameters
  let maxiters =   parseInt(req.query.iters || 100.0)
  let zoom =       parseFloat(req.query.zoom || 0.45)
  let centerI =    parseFloat(req.query.i || 0)
  let centerR =    parseFloat(req.query.r || -0.6) 
  let width =      parseInt(req.query.w || 600)
  let height =     parseInt(req.query.h || 400)
  let threshold =  parseInt(req.query.threshold || 80)
  const ratio = width / height

  let r, i
  let points = []
  
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
        let l = (iterations / (maxiters-1)) * 100
        if(l > threshold) points.push({r, i})  
      }
    }
  }

  fs.writeFileSync('./points.json', JSON.stringify(points))

  context.res = {
    body: `Done! Points array: ${points.length} elements`
  }
}