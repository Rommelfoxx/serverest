# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

This is a Cypress-based UI test automation project for **ServeRest** (a Brazilian demo e-commerce app commonly used for QA/testing practice). The repo currently contains only the initial Cypress scaffold plus one in-progress test suite — there is no application source code here, only tests.

## Commands

There are no `lint`/`build` scripts defined. `npm test` is the default placeholder (`echo "Error: no test specified" && exit 1`) and does not run Cypress — use the Cypress CLI directly.

- Open the Cypress Test Runner (interactive): `npx cypress open`
- Run all specs headlessly: `npx cypress run`
- Run a single spec file: `npx cypress run --spec "cypress/e2e/<path-to-spec>"`

## Architecture

- `cypress.config.js` — root Cypress config (`e2e.setupNodeEvents` is currently empty).
- `cypress/e2e/` — test specs. `spec.cy.js` is the default unmodified Cypress example spec.
- `cypress/e2e/ui/<feature>/` — feature-based test folders. Each pairs a Gherkin `.feature` file with a step-definitions `.js` file of the same base name (e.g. `cadastrarLogin.feature` + `cadastrarLogin.js`), following the `@badeball/cypress-cucumber-preprocessor` convention.
- `cypress/support/commands.js` / `cypress/support/e2e.js` — global Cypress support files (currently unmodified boilerplate).
- `cypress/fixtures/` — static test data (JSON) for mocking responses.

### Known gap

`cypress/e2e/ui/cadastrarLogin/cadastrarLogin.js` imports `Given`/`When`/`Then`/`AfterAll` from `@badeball/cypress-cucumber-preprocessor`, but that package is **not** in `package.json`/`node_modules`, and `cypress.config.js` does not register the cucumber preprocessor. The corresponding `.feature` file is also empty. This suite is not yet wired up — installing and configuring `@badeball/cypress-cucumber-preprocessor` (plus a `.feature` glob in `cypress.config.js`) is a prerequisite before these Gherkin-style tests can run.
