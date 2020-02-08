const fs = require('fs')
//const request = require('request-promise-native')
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const account = process.env.AzureWebJobsStorage.split(';')[1].replace('AccountName=', '');
const accountKey = process.env.AzureWebJobsStorage.split(';')[2].replace('AccountKey=', '')
const container = "fractals"

module.exports = async function (context, req) {
  // Load points file and pick a random one
  points = JSON.parse( fs.readFileSync('points.json') )
  let point = points[Math.floor(Math.random() * points.length)]

  try {
    let createFractal = require('../createFractal');

    zoomDepth =  Math.random() > 0.5 ? 20 : 500
    
    // Create a fake request object with query params
    let fractalRequest = {
      query: {
        w: parseInt(req.query.w || 400),
        h: parseInt(req.query.h || 300),
        zoom: parseInt(req.query.zoom || (3 + Math.random() * zoomDepth)),
        bright: 80 + Math.random() * 40,
        hue: Math.random() * 255,
        iter: 50 + Math.random() * 100,
        r: point.r,
        i: point.i,
        hueLoops: Math.random() * 4,
        innerBright: Math.random() * 50
      }
    }

    // Fake empty context
    let fractalCtx = {}
    // Call createFractal with our request, results will be put into ctx
    await createFractal(fractalCtx, fractalRequest)
    

    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(container);
    const content = fractalCtx.res.body;
    const blobName = new Date().getTime() + ".png";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    opt = {
      blobHTTPHeaders: {
        blobContentType: 'image/png'
      }
    }
    await blockBlobClient.upload(content, content.length, opt);
  
    context.res = {
      body: {
        imageUrl: `https://${account}.blob.core.windows.net/${container}/${blobName}`,
        fractal: fractalRequest.query
      }
    }

  } catch(err) {
    console.log(`### ERR ### ${err}`); 
  }
};