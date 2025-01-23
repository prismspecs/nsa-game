FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest
COPY . .

# Expose port
EXPOSE 3000

CMD ["node", "server.js"]
