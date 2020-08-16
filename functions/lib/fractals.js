const fs = require('fs')

//
// Generate parameters for a random but (hopefully) good looking fractal
//
module.exports.randomFractalRequest = function (width, height) {
  // 50/50 chance of mandelbrot or julia fractal
  let fractalRequest = {}
  const type = Math.random() >= 0.5 ? 'mandelbrot' : 'julia'

  if (type === 'julia') {
    // 'interesting' seeds for a Julia set, gathered from the web
    const seeds = [
      { r: +0.000, i: +0.800 },
      { r: +0.370, i: +0.100 },
      { r: +0.335, i: +0.335 },
      { r: -0.540, i: +0.540 },
      { r: -0.400, i: -0.590 },
      { r: +0.340, i: -0.050 },
      { r: -0.790, i: +0.150 },
      { r: -0.162, i: +1.040 },
      { r: +0.300, i: -0.010 },
      { r: +0.280, i: +0.008 },
      { r: -0.120, i: -0.770 },
      { r: -1.476, i: +0.000 },
      { r: 0.355534, i: -0.337292 }
    ]
    // Pick a random seed from the list
    const seed = seeds[Math.floor(Math.random() * seeds.length)]

    // Wiggle the seed very slightly
    seed.r += Math.random() * 0.01 - 0.005
    seed.i += Math.random() * 0.01 - 0.005

    // Wiggle about center [-0.5 ~ +0.5] slightly
    const r = Math.random() - 0.5
    const i = Math.random() - 0.5

    fractalRequest = {
      query: {
        type: 'julia',
        juliar: Number(seed.r.toFixed(6)),
        juliai: Number(seed.i.toFixed(6)),
        w: width,
        h: height,
        zoom: roundTo(Math.random() * 5, 2),
        bright: Math.round(70 + Math.random() * 60),
        hue: Math.round(Math.random() * 255),
        iter: Math.round(100 + Math.random() * 300),
        r: Number(r.toFixed(6)),
        i: Number(i.toFixed(6)),
        hueLoops: roundTo(Math.random() * 4, 2),
        innerBright: Math.round(Math.random() * 50)
      }
    }

  } else {
    // Load points file and pick a random one
    const points = JSON.parse(fs.readFileSync('points.json'))
    const point = points[Math.floor(Math.random() * points.length)]

    // Randomly pick deep or shallow zoom
    const zoomDepth = Math.random() > 0.5 ? 20 : 500

    // Create a fake request object with query params
    fractalRequest = {
      query: {
        type: 'mandelbrot',
        w: width,
        h: height,
        zoom: roundTo(3 + Math.random() * zoomDepth, 2),
        bright: Math.round(70 + Math.random() * 40),
        hue: Math.round(Math.random() * 255),
        iter: Math.round(50 + Math.random() * 100),
        r: Number(point.r.toFixed(6)),
        i: Number(point.i.toFixed(6)),
        hueLoops: roundTo(Math.random() * 4),
        innerBright: Math.round(Math.random() * 50)
      }
    }
  }

  return fractalRequest
}

//
// Get number of interations for a point in the fractal
//
module.exports.iterateMandlebrot = function (r, i, maxiters) {
  // Pre-calc some values for optimisation
  const escape = 256.0
  const escape2 = escape * escape
  const log2 = Math.log(2.0)

  // Iteration variables
  let a = 0; let b = 0
  let rx = 0; let ry = 0

  // Iterate mandlebrot set
  var iterations = 0
  let mag = rx * rx + ry * ry
  while (iterations < maxiters) {
    rx = a * a - b * b + r
    ry = 2 * a * b + i
    mag = rx * rx + ry * ry
    if (mag > escape2) {
      break
    }

    // Next iteration
    a = rx
    b = ry
    iterations++
  }

  if (iterations >= maxiters) {
    return maxiters
  }

  // I don't understand this, but it smooths the output
  const smoothIter = iterations + 2.0 - Math.log(Math.log(mag / Math.log(escape))) / log2
  return smoothIter
}


//
// Get number of interations for a point in the fractal
//
module.exports.iterateJulia = function (r, i, seedR, seedI, maxiters) {
  // Pre-calc some values for optimisation
  const escape = 256.0
  const escape2 = escape * escape
  const log2 = Math.log(2.0)

  // Iteration variables
  let a = r
  let b = i
  let rx = 0; let ry = 0

  // Iterate mandlebrot set
  let iterations = 0
  let mag = rx * rx + ry * ry
  while (iterations < maxiters) {
    rx = a * a - b * b + seedR
    ry = 2 * a * b + seedI
    mag = rx * rx + ry * ry
    if (mag > escape2) {
      break
    }

    // Next iteration
    a = rx
    b = ry
    iterations++
  }

  if (iterations >= maxiters) {
    return maxiters
  }

  // I don't understand this, but it smooths the output
  const smoothIter = iterations + 2.0 - Math.log(Math.log(mag / Math.log(escape))) / log2
  return smoothIter
}

function roundTo(num, places) {
  const p = Math.pow(10, places)
  return Math.round(num * p) / p
}