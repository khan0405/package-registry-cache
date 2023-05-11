FROM node:18-alpine3.17
ENV PORT=3030
ENV REPOSITORY_URL=https://dl-cdn.alpinelinux.org

WORKDIR /app
COPY package*.json prune.js ./
RUN apk add --no-cache dumb-init && npm ci --omit=dev && npm cache clean --force && node prune --deploy && mkdir -p data
VOLUME /app/data
COPY . .
ENTRYPOINT [ "dumb-init", "--", "docker-entrypoint.sh" ]
CMD ["node", "."]
