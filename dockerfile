FROM node:26-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY registro-atividades/package*.json ./
RUN npm ci

COPY registro-atividades/ .
RUN npx prisma generate && npm run build

USER node
EXPOSE 3000
CMD ["npm", "start"]