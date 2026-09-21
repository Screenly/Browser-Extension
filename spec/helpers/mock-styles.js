if (typeof Bun !== 'undefined') {
  Bun.plugin({
    name: 'mock-styles',
    setup(build) {
      build.onLoad({ filter: /\.(css|scss)$/ }, () => ({
        contents: '',
        loader: 'js',
      }));
    },
  });
} else {
  require.extensions['.css'] = () => {};
  require.extensions['.scss'] = () => {};
}
