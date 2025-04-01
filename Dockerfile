FROM node:22

WORKDIR /app
RUN mkdir -p /output
RUN chmod -R 777 /output

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm install --quiet

ADD . /app
