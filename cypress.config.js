const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');


module.exports = defineConfig({

  retries: {
    runMode: 1,
    openMode: 0,
  },
  viewportWidth: 1440,
  viewportHeight: 900,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/mocha/.jsons',
    overwrite: false,
    html: false,
    json: true,
  },
  expose: {
    apiUrl: 'https://serverest.dev'
  },
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    baseUrl: 'https://front.serverest.dev/'
  },
  setupNodeEvents(on, config) {
    return config
  }
});