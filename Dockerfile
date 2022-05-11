# This is not used!

FROM mcr.microsoft.com/azure-functions/node:4-node16

ENV AzureWebJobsScriptRoot=/home/site/wwwroot 
ENV AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY functions /home/site/wwwroot

RUN cd /home/site/wwwroot && npm install