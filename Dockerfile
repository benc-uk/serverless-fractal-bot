FROM mcr.microsoft.com/azure-functions/node:3.0-node12

ENV AzureWebJobsScriptRoot=/home/site/wwwroot 
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY functions /home/site/wwwroot

RUN cd /home/site/wwwroot && npm install