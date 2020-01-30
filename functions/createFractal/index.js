const WIDTH = 800
const HEIGHT = 600

// Pan and zoom parameters
var offsetx = -WIDTH / 2;
var offsety = -HEIGHT / 2;
var panx = -100;
var pany = 0;
var zoom = 200;
var maxiters = 150;

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
  zoom = req.query.zoom || 200
  panx = parseFloat(req.query.panx || "-100")
  pany = parseFloat(req.query.pany || "0") 
  let hue = req.query.hue || 130

  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')
  
  // Generate image
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      let iterations = iterate(x, y);

      if (iterations == maxiters) {
        ctx.fillStyle = `rgb(0, 0, 0)`;
      } else {
        let l = (iterations / (maxiters-1)) * 140.0
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


// Calculate the color of a specific pixel
function iterate(x, y) {
  // Convert the screen coordinate to a fractal coordinate
  var x0 = (x + offsetx + panx) / zoom;
  var y0 = (y + offsety + pany) / zoom;

  // Iteration variables
  var a = 0;
  var b = 0;
  var rx = 0;
  var ry = 0;

  // Iterate
  var iterations = 0;
  let mag = rx * rx + ry * ry;
  while (iterations < maxiters) {
    rx = a * a - b * b + x0;
    ry = 2 * a * b + y0;
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

  let smoothIter = iterations + 2.0 - Math.log(Math.log(mag/Math.log(escape)))/log2
	return smoothIter
}