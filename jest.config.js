module.exports = {
  "setupFilesAfterEnv": [ "./test/setup.js" ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
    "!**/node_modules/**",
    "!dist/**",
  ]
}