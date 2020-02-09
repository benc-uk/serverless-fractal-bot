const iterateJulia = require('../lib/fractals').iterateJulia
const iterateMandlebrot = require('../lib/fractals').iterateMandlebrot

module.exports = async function (context, req) {
  var createCanvas
  try {
    createCanvas = require('canvas').createCanvas
  } catch(err) {
    context.res = { status: 500, body: err.toString() }       
    return
  }

  // Parse parameters
  let type =       req.query.type || "mandelbrot"
  let maxiters =   parseInt(req.query.iters || 100.0)
  let zoom =       parseFloat(req.query.zoom || 0.45)
  let centerI =    parseFloat(req.query.i || 0)
  let centerR =    parseFloat(req.query.r || -0.6) 
  let width =      parseInt(req.query.w || 600)
  let height =     parseInt(req.query.h || 400)
  let hue =        parseInt(req.query.hue || 120)
  let hueLoops =   parseFloat(req.query.hueLoops || 1)  
  let sat =        parseInt(req.query.sat || 100)
  let brightness = parseInt(req.query.bright|| 150)
  let seedR =      parseFloat(req.query.juliar || 0.362)
  let seedI =      parseFloat(req.query.juliai || 0.370)
  let innerBright = parseFloat(req.query.innerBright || 0)
  
  const ratio = width / height
  
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  let r, i
  
  // Generate image
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {

      // Convert x,y pixel space to r,i complex plane
      r = centerR + ((x - width/2) / width) / zoom * ratio
      i = centerI + ((y - height/2) / height) / zoom

      let iterations = 0

      // Actual fractal calculations here
      if(type === "mandelbrot") {
        iterations = iterateMandlebrot(r, i, maxiters)
      } else if (type === "julia") {
        iterations = iterateJulia(r, i, seedR, seedI, maxiters)      
      } else {
        context.res = { status: 400, body: "Invalid fractal type, please specify 'mandelbrot' or 'julia'" }
        return
      }

      // Choose colour of pixel
      if (iterations == maxiters) {
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${innerBright}%)`
      } else {
        // Outside the set, colour based on number of iterations
        let nIter = iterations / (maxiters - 1)
        let lumVal = nIter * brightness
        let hueVal = Math.cos(nIter * hueLoops) * hue

        ctx.fillStyle = `hsl(${hueVal}, ${sat}%, ${lumVal}%)`
      }  

      // Draw the pixel
      ctx.fillRect(x, y, 1, 1)    
    }
  }

  // Return canvas as a buffer with PNG context type
  // isRaw required to stop runtime interpreting payload
  context.res = {
    isRaw: true,
    headers: { "Content-Type": "image/png" },
    body: canvas.toBuffer()
  }
}