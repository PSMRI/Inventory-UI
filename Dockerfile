# ---------- Stage 1: Build Angular App ----------
FROM node:20.12.1-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

RUN cp src/environments/environment.local.ts src/environments/environment.ts
 
RUN npm run build-ci

# ---------- Stage 2: Serve with http-server ----------
FROM node:20.12.1-alpine3.19

# Install lightweight web server
RUN npm install -g http-server

WORKDIR /app

COPY --from=build /app/dist/Inventory-UI ./

# Add healthcheck to verify application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:4201/ || exit 1

EXPOSE 4201

CMD ["http-server", "--cors", "--gzip", "-c3600", "-p", "4201"]
