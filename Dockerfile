FROM node:22

ARG USER_ID
ARG GROUP_ID
ARG USER_NAME

RUN userdel node
RUN groupadd -g ${GROUP_ID} ${USER_NAME}
RUN useradd \
    -u ${USER_ID} \
    -g ${GROUP_ID} \
    --create-home \
    --non-unique \
    ${USER_NAME}

WORKDIR /app
RUN mkdir -p /output
RUN chmod -R 777 /output

# All of these requirements are for headless Chrome used for unit testing.
RUN apt-get update --fix-missing \
    && apt-get install -y \
        ca-certificates \
        fonts-liberation \
        gconf-service \
        libappindicator1 \
        libasound2 \
        libatk1.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libfontconfig1 \
        libgcc1 \
        libgconf-2-4 \
        libgdk-pixbuf2.0-0 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libpangocairo-1.0-0 \
        libstdc++6 \
        libx11-6 \
        libx11-xcb1 \
        libxcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        lsb-release \
        wget \
        zip \
        xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Use docker caching system to cache installed packages.
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
RUN npm install --quiet

USER ${USER_ID}:${GROUP_ID}

ADD . /app
