FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV PORT=8787
ENV APP_URL=http://127.0.0.1:8787
EXPOSE 8787

CMD ["npm", "start"]
