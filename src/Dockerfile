# Use an official Node.js runtime as a parent image
FROM node:20 AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Rebuild bcrypt for the correct architecture
RUN npm rebuild bcrypt --build-from-source

# Use a smaller base image for the final image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app ./

# Expose the port the app runs on
EXPOSE 8081

# Start the application
CMD [ "node", "server.js" ]
