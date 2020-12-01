module.exports = {
    preset: "ts-jest",
    transform: {
        "^.+\\.js$": "babel-jest"
    },
    testRegex: "\\.test\\.ts$",
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    moduleNameMapper: {
        "^@util": "<rootDir>/src/common/util"
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
    globals: {
        'ts-jest': {
          babelConfig: true
        }
    }
}
