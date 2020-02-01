

// Fractal parameters
var width     // output image width
var height    // output image height
var panx
var pany
var zoom
var maxiters
var hue

const escape = 256.0
const escape2 = escape * escape
const log2 = Math.log(2.0)

module.exports = async function (context, req) {
  var createCanvas;
  try {
    createCanvas = require('canvas').createCanvas;
  } catch(err) {
    context.res = {
      status: 500,
      body: err.toString()
    };
    return
  }

  maxiters = req.query.iters || 150.0  
  zoom = parseFloat(req.query.zoom || 2)
  panx = parseFloat(req.query.panx || -0.3)
  pany = parseFloat(req.query.pany || 0) 
  width = parseInt(req.query.width || 300)
  height = parseInt(req.query.height || 200)
  hue = parseInt(req.query.hue || 130)
  const ratio = width / height
  
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  let r, i;
  
  // Generate image
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      r = panx + ((x - width/2) / width) * zoom * ratio
      i = pany + ((y - height/2) / height) * zoom

      // Actual work here
      let iterations = iterateFractal(r, i);

      // Choose colour of pixel
      if (iterations == maxiters) {
        ctx.fillStyle = `rgb(0, 0, 0)`;
      } else {
        // Outside the set, colour based on number of iterations
        let l = (iterations / (maxiters-1)) * 150.0
        ctx.fillStyle = `hsl(${hue}, 100%, ${l}%)`;
      }  

      ctx.fillRect(x, y, 1, 1);
    }
  }

  context.res = {
    isRaw: true,
    headers: { "Content-Type": "image/png" },
    body: canvas.toBuffer()
  };
};


//
// Get number of interations for a point in the fractal
//
function iterateFractal(r, i) {
  // Iteration variables
  var a = 0;
  var b = 0;
  var rx = 0;
  var ry = 0;

  // Iterate
  var iterations = 0;
  let mag = rx * rx + ry * ry;
  while (iterations < maxiters) {
    rx = a * a - b * b + r;
    ry = 2 * a * b + i;
    mag = rx * rx + ry * ry
		if (mag > escape2) {
			break
		}

    // Next iteration
    a = rx;
    b = ry;
    iterations++;
  }

  if (iterations >= maxiters) {
		return maxiters
	}

  // I don't understand this, but it smooths the output
  let smoothIter = iterations + 2.0 - Math.log(Math.log(mag/Math.log(escape)))/log2
	return smoothIter
}