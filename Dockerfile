FROM node:22-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies (this layer will be cached unless package.json changes)
RUN npm ci

# Copy source code (this layer changes most frequently)
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]