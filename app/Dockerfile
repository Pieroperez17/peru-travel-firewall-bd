# Etapa 1: compila el frontend React (Vite) a archivos estaticos
FROM node:22-alpine AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Etapa 2: backend Express que sirve la API y el frontend compilado
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY --from=web /web/dist ./web/dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
