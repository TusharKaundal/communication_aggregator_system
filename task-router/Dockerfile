# Use Node 24 LTS
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]