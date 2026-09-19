# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

# Copy built frontend to backend public folder
COPY --from=frontend-build /app/frontend/dist ./public

# Copy backend source
COPY backend/ .

EXPOSE 5000
CMD ["npm", "start"]
