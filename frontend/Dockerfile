FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps --verbose
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
