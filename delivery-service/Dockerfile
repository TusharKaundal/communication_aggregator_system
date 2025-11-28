# Use Node 24 LTS
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]