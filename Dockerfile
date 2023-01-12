FROM node:19-bullseye
WORKDIR usr/src/app
RUN yarn init -y && yarn add puppeteer && apt-get update && apt-get install chromium -y && yarn upgrade
EXPOSE 3000
CMD ["node", "src/app.js"]
