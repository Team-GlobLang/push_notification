# =========================
# Dependencias
# =========================
FROM node:22-alpine AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install

# =========================
# Builder
# =========================
FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Generar Prisma antes de compilar TS
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# =========================
# Imagen final
# =========================
FROM node:22-alpine AS prod
WORKDIR /usr/src/app

# Copiar node_modules de producción
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copiar dist y Prisma
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/generated ./generated 

ENV NODE_ENV=production
USER node

CMD ["node", "dist/main.js"]
