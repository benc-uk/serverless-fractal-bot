const ColorConvert = require('color-convert');
const PassThroughStream = require('stream').PassThrough;
const PureImage = require('pureimage');

const iterateJulia = require('../lib/fractals').iterateJulia;
const iterateMandlebrot = require('../lib/fractals').iterateMandlebrot;

//
// Render a fractal and return it as a PNG
//
module.exports = async function (context, req) {
  // Parse query parameters, there's a LOT
  let type =        req.query.type || "mandelbrot"
  let maxiters =    parseInt(req.query.iters || 100.0)
  let zoom =        parseFloat(req.query.zoom || 0.45)
  let centerI =     parseFloat(req.query.i || 0)
  let centerR =     parseFloat(req.query.r || -0.6) 
  let width =       parseInt(req.query.w || 600)
  let height =      parseInt(req.query.h || 400)
  let hue =         parseInt(req.query.hue || 120)
  let hueLoops =    parseFloat(req.query.hueLoops || 1)  
  let sat =         parseInt(req.query.sat || 100)
  let brightness =  parseInt(req.query.bright|| 150)
  let juliaR =      parseFloat(req.query.juliar || 0.362)
  let juliaI =      parseFloat(req.query.juliai || 0.370)
  let innerBright = parseFloat(req.query.innerBright || 0)
  
  const ratio = width / height
  const bitmap = PureImage.make(width, height);
  let r, i
  let totalIter = 0
  let rgb = [0, 0, 0]

  // Generate fractal image, looping x, y over canvas size
  for (var x = 0; x < bitmap.width; x++) {
    for (var y = 0; y < bitmap.height; y++) {

      // Convert x,y pixel space to r,i complex plane
      // Don't ask me to explain this
      r = centerR + ((x - width/2) / width) / zoom * ratio
      i = centerI + ((y - height/2) / height) / zoom

      let iterations = 0

      // Actual fractal calculations here
      if(type === "mandelbrot") {
        iterations = iterateMandlebrot(r, i, maxiters)
      } else if (type === "julia") {
        iterations = iterateJulia(r, i, juliaR, juliaI, maxiters)      
      } else {
        context.res = { status: 400, body: "Invalid fractal type, please specify 'mandelbrot' or 'julia'" }
        return
      }

      // Choose colour of pixel
      if (iterations == maxiters) {
        // Inside the set - colour based on inner colour
        // ColorConvert is used as PureImage doesn't support HSL yet
        rgb = ColorConvert.hsl.rgb(hue, sat, innerBright)
      } else {
        // Outside the set, colour based on number of iterations
        totalIter += iterations

        // Normalize iterations to 0 ~ 1
        let nIter = iterations / (maxiters - 1)       
        // Luminance based on brightness factor
        let lumVal = nIter * brightness
        // Hue is calculated with a cosine to create repeating colour loops
        let hueVal = Math.cos(nIter * hueLoops) * hue

        rgb = ColorConvert.hsl.rgb(hueVal,sat,lumVal)
      }  

      // Draw the pixel direct to bitmap, no need for a context
      bitmap.setPixelRGBA_i(x, y, rgb[0], rgb[1], rgb[2], 255)
    }
  }

  // Use a PassThrough stream to copy PNG data into an array
  const stream = new PassThroughStream();
  const pngData = [];
  stream.on('data', chunk => pngData.push(chunk));
  stream.on('end', () => {});
  await PureImage.encodePNGToStream(bitmap, stream);
  // Convert the array into a Buffer for sending in HTTP res
  const bufferImage = Buffer.concat(pngData);

  // Return canvas as a buffer with PNG context type
  // isRaw required to stop Functions runtime interpreting payload
  context.res = { 
    isRaw: true,
    headers: { 
      "Content-Type": "image/png",
      "Fractal-Iters": Math.floor(totalIter)
    },
    body: bufferImage
  }
}
