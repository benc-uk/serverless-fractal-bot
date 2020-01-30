const WIDTH = 800
const HEIGHT = 600

// Pan and zoom parameters
var offsetx = -WIDTH / 2;
var offsety = -HEIGHT / 2;
var panx = -100;
var pany = 0;
var zoom = 200;
var maxiters = 150;
var palette;

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

  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')
  
  // Generate image
  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      let iterations = iterate(x, y);

      if (iterations == maxiters) {
        ctx.fillStyle = `rgb(0, 0, 0)`;
      } else {
        let r = Math.floor((iterations / (maxiters-1)) * 100)
        ctx.fillStyle = `hsl(${req.query.hue || 30}, 100%, ${r}%)`;
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
  while (iterations < maxiters && (rx * rx + ry * ry <= 4)) {
      rx = a * a - b * b + x0;
      ry = 2 * a * b + y0;

      // Next iteration
      a = rx;
      b = ry;
      iterations++;
  }
  return iterations
}