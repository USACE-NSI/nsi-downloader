# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN  npm install --legacy-peer-deps
COPY . .
RUN npm run build 
# outputs /app/dist

# ---- serve (non-root, port 8080) ----
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER nsi
EXPOSE 8080
