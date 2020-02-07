

//
// Get number of interations for a point in the fractal
//
module.exports.iterateMandlebrot = function(r, i, maxiters) {
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
  let smoothIter = iterations + 2.0 - Math.log(Math.log(mag / Math.log(escape))) / log2
  return smoothIter
}


//
// Get number of interations for a point in the fractal
//
module.exports.iterateJulia = function(r, i, seedR, seedI, maxiters) {
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
  let smoothIter = iterations + 2.0 - Math.log(Math.log(mag / Math.log(escape))) / log2
  return smoothIter
}