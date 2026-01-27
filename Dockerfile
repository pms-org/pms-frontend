# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=k8s

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/pms-frontend/browser /usr/share/nginx/html
COPY nginx-k8s.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]