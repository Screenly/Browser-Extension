FROM oven/bun:1.4.0

WORKDIR /app
RUN mkdir -p /output
RUN chmod -R 777 /output

ADD package.json /app/package.json
ADD bun.lock /app/bun.lock
RUN bun install

ADD . /app
