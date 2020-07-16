module.exports = {
  "setupFilesAfterEnv": [ "./test/setup.ts" ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/types.d.ts",
    "!**/node_modules/**",
    "!dist/**",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  },
}