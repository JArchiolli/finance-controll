FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]
