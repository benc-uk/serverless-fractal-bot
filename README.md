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
- Have Node.js installed
- Clone the repo
- Install [Function Core Tools](https://github.com/Azure/azure-functions-core-tools) v2 or v3
- cd `functions`
- `npm install`
- Place Azure storage account connection string in `AzureWebJobsStorage` key in `local.settings.json`
- `func start`
- Test by hitting http://localhost:7071/api/createFractal or http://localhost:7071/api/randomFractal endpoints with browser

> Note. The function `tweetRandomFractal` will try to run every 2 hours (as defined in function.json), this will not work until some Twitter API credentials are provided, see below

# Repo Structure
- `/functions/` Functions App project folder with all functions code
- `/.github`
 
# Functions
- `createFractal` - Main fractal 
- `createPoints`
- `randomFractal`
- `tweetRandomFractal`


# Deploying To Azure
Blah

# CI & GitHub Actions
Also blah

# Twitter API & Auth Credentials
Blah words go here
