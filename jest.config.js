// jest.config.js
module.exports = {
    moduleFileExtensions: [
        'js',
        'ts',
        'json',
        'vue'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.vue$': 'vue-jest'
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    globals: {
        'vue-jest': {
            compilerOptions: {
                isCustomElement: (tag) => tag.startsWith('a-'),
            },
        },
    },
}