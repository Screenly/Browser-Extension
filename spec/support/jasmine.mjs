export default {
  spec_dir: "dist",
  spec_files: [
    "tests.bundle.js"
  ],
  helpers: [
    "../src/test/environment.js"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true
  }
}
