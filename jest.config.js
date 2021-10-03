module.exports = {
    "roots": [
      "<rootDir>"
    ],
    "testMatch": [
      "**/test/**/*.test.ts"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/src/**/*.ts",
      "!**/src/adapters/**/*.ts"
    ]
  }