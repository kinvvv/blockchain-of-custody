# Base image
FROM node:18

# Install necessary libraries
RUN apt-get update && apt-get install -y \
  libzmq3-dev build-essential python3 python3-pip
  
# Set environment variables
ENV PYTHON=/usr/bin/python3

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install -g node-gyp
RUN npm install

# Rebuild ZeroMQ for compatibility with the current environment
RUN npm install zeromq

# Copy the rest of the application code
COPY . .

# Command to run the transaction processor
CMD ["node", "index.js"]
