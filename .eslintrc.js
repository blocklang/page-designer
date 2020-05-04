module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        "plugin:react/recommended"
    ],
    settings: {
        react: {
            version: '16.13',
            pragma: 'tsx'
        }
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 0,
        "react/no-unknown-property": 0,
        'react/react-in-jsx-scope': 0,
    }
};