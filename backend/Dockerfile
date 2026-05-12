# Production Dockerfile
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Start command
CMD [ "node", "src/server.js" ]
