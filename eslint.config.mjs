import { defineConfig } from 'eslint/config'
import pluginCypress from 'eslint-plugin-cypress'

export default defineConfig([
    {
        files: ['cypress/**/*.js'],

        extends: [
            pluginCypress.configs.recommended
        ],

        rules: {
            'cypress/no-unnecessary-waiting': 'error',
            'cypress/no-force': 'warn',
            'cypress/require-data-selectors': 'warn',
            'cypress/unsafe-to-chain-command': 'error'
        }
    }
])