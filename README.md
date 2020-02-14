# Serverless Fractal Bot
An experiment in using Azure Functions to generate random images of fractals and tweet them via the Twitter API. Uses Node.js, [Canvas](https://www.npmjs.com/package/canvas) and [Twitter](https://www.npmjs.com/package/twitter) packages

Showcases:
- Use of Functions for image generation in memory
- Cross function calling and combining with shared libraries and external packages
- HTTP and Timer triggers
- Twitter bot use-case

# Sample Images
![](https://user-images.githubusercontent.com/14982936/74386202-4c3ee680-4ded-11ea-8be1-8260333b560a.png)

![](https://user-images.githubusercontent.com/14982936/74386201-4ba65000-4ded-11ea-8326-a13009692ef7.png)

![](https://user-images.githubusercontent.com/14982936/74386200-4b0db980-4ded-11ea-9cab-34828273e64b.png)

![](https://user-images.githubusercontent.com/14982936/74386198-4a752300-4ded-11ea-8341-fa894d3cb163.png)


# Running Locally
- Have Node.js 10+ installed
- Git clone the repo
- Install [Function Core Tools](https://github.com/Azure/azure-functions-core-tools) v2 or v3
- cd `functions`
- `npm install`
- Place Azure storage account connection string in `AzureWebJobsStorage` key in `local.settings.json`
- `func start`
- Test by hitting http://localhost:7071/api/createFractal or http://localhost:7071/api/randomFractal endpoints with browser

> Note. The function `tweetRandomFractal` will try to run every 2 hours (as defined in function.json), this will not work until some Twitter API credentials are provided, see below

> Note. When running locally there is no dependency on Windows, everything will work on Linux/MacOS

# Deployment
The app consists of just a single [Function App in Azure](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview). Note. Windows version of Functions must be used, this is due to the NPM canvas module used. The Linux version refuses to install or run inside  App Service (trust me on this one, I tried *everything*)

### Azure resources

```bash
region=northeurope
resgrp=demo.serverless
appname=fractals
storage=func2019

az group create --name $resgrp --location $region

az storage account create --name $storage --resource-group $resgrp \
--sku Standard_LRS --kind StorageV2

az functionapp create --resource-group $resgrp --name $appname \
--os-type Windows --runtime node --runtime-version 10 \
--consumption-plan-location $region \
--storage-account $storage
```

### Deploy the functions code 
On Windows run `npm install` and zip the functions folder, then use zip-deploy
```
az functionapp deployment source config-zip --src ./functions.zip --name $appname -g $resgrp
```

If running on Linux/Mac use the GitHub Action to deploy the functions code

 
# Functions
This project consists of four functions. There is a `lib/fractals.js` which contains shared code

## createFractal
**Trigger**: HTTP  
Main fractal generation function will create a fractal based on the input URL query parameters.  
**Output**: HTTP response with PNG body

## createPoints
**Trigger**: HTTP  
Utility function which generates a static `points.json` file, which is used by the random fractal functions in order to find visually interesting points in the Mandlebrot set to use.  
**Output**: HTTP response with JSON body

## randomFractal
**Trigger**: HTTP  
Render a random fractal and return it in the browser.  
**Output**: HTTP response with PNG body

## tweetRandomFractal
**Trigger**: Timer  
Generates a random fractal and sends it to twitter as a tweet with the image embedded as media.  
**Output**: None

# CI & GitHub Actions
Also blah

# Twitter API & Auth Credentials
Blah words go here

Set these either in `local.settings.json` or as app settings on the Function App
```
TWITTER_ACCESS_TOKEN
TWITTER_API_KEY
TWITTER_API_SECRET
TWITTER_TOKEN_SECRET
```