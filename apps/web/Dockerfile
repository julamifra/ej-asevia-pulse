FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json

RUN npm install

COPY apps/web ./apps/web

EXPOSE 5173

CMD ["npm", "run", "dev", "-w", "@asevia/web"]
