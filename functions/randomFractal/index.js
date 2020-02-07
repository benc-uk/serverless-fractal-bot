const fs = require('fs')
const request = require('request-promise-native')

module.exports = async function (context, req) {
  points = JSON.parse( fs.readFileSync('points.json') )
  let point = points[Math.floor(Math.random() * points.length)]

  try {
    let createFractal = require('../createFractal');
    let request = {
      query: {
        w: 1200,
        h: 800,
        zoom: 3 + Math.random() * 40,
        bright: 120,
        hue: Math.random() * 255,
        iter: 50 + Math.random() * 500,
        r: point.r,
        i: point.i
      }
    }

    let ctx = {}
    await createFractal(ctx, request)
    context.res = ctx.res
  } catch(err) {
    console.log(`### ERR ### ${err}`); 
  }
};