FROM node:16
# 앱 디렉터리 생성
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 443
CMD [ "node", "bin/www" ]