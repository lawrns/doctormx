FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY server ./server
COPY dist ./dist

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "--experimental-specifier-resolution=node", "--loader", "tsx/esm", "server/index.ts"]




