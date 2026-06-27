FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json

RUN npm install

COPY apps/api ./apps/api
COPY data ./data

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 3000

CMD ["npm", "run", "start:docker", "-w", "@asevia/api"]
