# syntax=docker/dockerfile:1

# ---------- Stage 1: install dependencies ----------
# Dipisah supaya layer node_modules bisa di-cache selama
# package.json / package-lock.json tidak berubah.
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Stage 2: build aplikasi ----------
FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Catatan: variabel di aplikasi Vite ikut tertanam di bundle JS (terlihat publik).
# Gunakan hanya untuk demo; untuk produksi pindahkan panggilan Gemini ke backend proxy.
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# ---------- Stage 3: runtime ----------
# Image akhir hanya berisi Nginx + file statis hasil build (tanpa Node, tanpa source).
# nginx-unprivileged berjalan sebagai user non-root dan listen di port 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
RUN apk upgrade --no-cache
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
