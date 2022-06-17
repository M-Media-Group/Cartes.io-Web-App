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
    globals: {
        'vue-jest': {
            compilerOptions: {
                isCustomElement: (tag) => tag.startsWith('a-'),
            },
        },
    },
}