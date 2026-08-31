FROM node:24-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# build the project (produces dist and copies static files into dist)
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.62.0-noble AS runtime
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
# copy built output from builder stage
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]