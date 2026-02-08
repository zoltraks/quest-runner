const globals = require('globals');

module.exports = [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                play: 'readonly',
                task: 'readonly',
                step: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'no-var': 'warn',
            'prefer-const': 'warn',
            'semi': ['warn', 'always'],
            'indent': ['warn', 4],
            'quotes': ['warn', 'single', { avoidEscape: true }],
        },
    },
];
