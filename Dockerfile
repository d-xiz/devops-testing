# Use an official Node.js runtime as a parent image
FROM node:20
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install app dependencies
RUN npm ci
# Bundle app source
COPY . .
# Expose the port your app runs on
EXPOSE 5000
# Set environment variable for the port
ENV NODE_ENV=production
ENV PORT=5000
# Define the command to run your app
CMD [ "node", "index.js" ]
