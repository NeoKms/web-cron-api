FROM node:18

RUN apt update && apt install nano mc -y

WORKDIR /var/www/app/

COPY . .

RUN npm install
RUN npm install pm2@latest -g
RUN rm -r src test .husky .git

CMD [ "pm2-runtime", "start", "app.config.js" ]