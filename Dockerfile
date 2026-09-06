FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev || npm install
COPY . .
RUN npm run build --if-present
EXPOSE 3000
CMD ["npm", "start"]
