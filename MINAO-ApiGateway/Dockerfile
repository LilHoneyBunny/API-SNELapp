FROM node:20

RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/index.js"]