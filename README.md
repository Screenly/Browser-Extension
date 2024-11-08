# Develop

The extension is built using webpack.

```bash
$ docker compose up
```

Now load the content of the `dist/` folder as an unpacked extension in Chrome. As you make changes to the code, dist is automatically rebuilt.

# Distribute

```bash
$ docker compose build
$ docker run \
    --rm -ti \
    -v $(pwd):/app:delegated \
    -v /app/node_modules \
    sce_webpack:latest \
    /bin/bash -c "npx webpack --config webpack.prod.js"

(cd dist && zip -r ../screenly-chrome-extension-0.3.zip *)
```

# Unit testing

```bash
$ docker compose build
$ docker run \
    --rm -ti \
    -v $(pwd):/app:delegated \
    -v /app/node_modules \
    sce_webpack:latest \
    /bin/bash -c "npx webpack --config webpack.dev.js && npm test"

```

1. Build the extension in dev mode.
2. Load the extension as an unpacked extension from the `dist` folder.
3. Find the extension URL and then open `chrome-extension://extension-id/test/tests.html` in Chrome.
