FROM node:22-alpine

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start"]
