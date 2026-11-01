FROM node:22-slim

WORKDIR /app

# Install everything (dev dependencies too) so `npm test` also works inside the container.
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY src ./src
COPY test ./test

ENV NODE_ENV=production
RUN mkdir -p /app/uploads && chown -R node:node /app
USER node

EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
