FROM registry:2.8.1
RUN apk add --no-cache dumb-init
ENV REGISTRY_STORAGE_DELETE_ENABLED=true
COPY ./prune.sh /etc/periodic/hourly
COPY ./run.sh /
RUN chmod +x /run.sh && chmod +x /etc/periodic/hourly/prune.sh
ENTRYPOINT [ "dumb-init", "--", "/run.sh" ]
