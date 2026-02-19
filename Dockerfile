# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy frontend dependencies
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install

# Copy frontend source
COPY . .

# Build frontend
RUN pnpm build

# Build backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/src ./src
COPY server/tsconfig.json ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy backend
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/node_modules ./node_modules

# Copy frontend build
COPY --from=builder /app/dist ./public

# Create data directory for database
RUN mkdir -p /app/data

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5000

CMD ["node", "dist/index.js"]
