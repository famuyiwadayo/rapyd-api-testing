# docker build -t famuyiwa/rapyd-api:latest . \
#     && docker push famuyiwa/rapyd-api:latest

docker build --platform=linux/amd64 -t rapyd.azurecr.io/rapyd-api:latest-amd64 . 
    && docker push rapyd.azurecr.io/rapyd-api:latest-amd64