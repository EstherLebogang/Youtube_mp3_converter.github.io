# Use official Node.js base image
FROM node:20

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg yt-dlp && \
    apt-get clean

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy rest of the app files
COPY . .

# Expose backend port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
