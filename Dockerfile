# Use a specific Node version for consistency
FROM node:20-alpine
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy package files first to leverage Docker's layer caching
# This ensures 'npm install' only runs when dependencies change
COPY package*.json ./
 
# Install dependencies
RUN  npm install --legacy-peer-deps
 
# Copy the rest of your application code
COPY . .
 
# Expose Vite's default port
EXPOSE 5173
 
# Start the dev server with --host to allow external access
CMD ["npm", "run", "dev", "--", "--host"]