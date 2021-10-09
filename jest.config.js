module.exports = {
	roots: ["<rootDir>"],
	testMatch: ["**/test/**/*.test.ts", "**/test/**/*.integration.ts"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest"
	},
	collectCoverageFrom: ["**/src/**/*.ts", "!**/src/ports/**/*.ts"]
}
