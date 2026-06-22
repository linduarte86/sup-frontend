# =========================
# Etapa 1: Dependências
# =========================
FROM node:20-alpine AS deps

WORKDIR /sup-frontend

COPY package.json package-lock.json ./

RUN npm ci


# =========================
# Etapa 2: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /sup-frontend

COPY --from=deps /sup-frontend/node_modules ./node_modules

COPY . .

RUN npm run build


# =========================
# Etapa 3: Runtime
# =========================
FROM node:20-alpine AS runner

WORKDIR /sup-frontend

ENV NODE_ENV=production

COPY --from=builder /sup-frontend/.next/standalone ./

COPY --from=builder /sup-frontend/.next/static ./.next/static

COPY --from=builder /sup-frontend/public ./public

EXPOSE 3000

CMD ["node", "server.js"]