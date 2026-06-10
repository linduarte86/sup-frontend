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

ARG NEXT_PUBLIC_API_BACKEND_URL
ENV NEXT_PUBLIC_API_BACKEND_URL=$NEXT_PUBLIC_API_BACKEND_URL

RUN npm run build


# =========================
# Etapa 3: Runtime
# =========================
FROM node:20-alpine AS runner

WORKDIR /sup-frontend

ENV NODE_ENV=production

# instala só dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copia build do Next
COPY --from=builder /sup-frontend/.next ./.next
COPY --from=builder /sup-frontend/public ./public
COPY --from=builder /sup-frontend/next.config.* ./

EXPOSE 3000

CMD ["npm", "run", "start"]