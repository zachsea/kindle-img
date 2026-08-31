FROM mcr.microsoft.com/playwright:v1.62.0-noble
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY src/dashboard.html ./dist/dashboard.html
CMD ["node", "dist/index.js"]