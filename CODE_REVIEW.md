# Code Review — front-serverest

Review of the Cypress automation suite: real bugs found, architecture/pattern gaps, resilience improvements, and a priority order to fix them.

## 🐛 Real bugs (not just style)

**1. Unclosed `data-testid` selector strings** — `cypress/pages/Cadastro.js:3-10` and `cypress/pages/Home.js:3-6` all write `cy.get('[data-testid="nome"')` — missing the closing `]`. This is invalid CSS; it only "works" because jQuery's selector engine happens to tolerate it, not because it's correct. The same broken pattern is copy-pasted straight into the spec itself at `cypress/e2e/ui/SignupLogin/signUp.cy.js:43-45,60,66,78-80,84-86,90-92`, which is a strong sign these selectors were copied without validation. `Login.js` closes its brackets correctly (`'[data-testid="email"]'`) — use that as the reference.

**2. `cy.intercept` registered *after* the action that fires the request** — `signUp.cy.js:47-51`:
```js
cy.intercept('POST', 'https://serverest.dev/login').as('login')
cy.get('[data-testid="cadastrar"').should('be.visible').click()   // fires POST /usuarios
cy.intercept('POST', 'https://serverest.dev/usuarios').as('criarUsuario')  // registered too late
cy.wait('@criarUsuario')
```
The `/usuarios` intercept is set up **after** the click that triggers it. Cypress can only capture a request if the route is registered before the request fires. This is a race — it may pass by luck on a slow network and hang/timeout on a fast one. Always register every intercept you're about to `cy.wait()` on *before* the triggering action.

**3. `user.senha` doesn't exist** — `signUp.cy.js:62`: `.type(user.senha)`. The test's `user` object only has `.password` (line 31), not `.senha`. This types `undefined` into the password field in the "sign-up new admin user" test.

**4. Mislabeled / duplicate test titles in `usuarios.cy.js`**, which makes report output actively misleading:
- Line 214: `it('Successfully delete user', ...)` — inside the `PUT` describe block, and the request itself is a `PUT` (an edit), not a delete.
- Line 241: `it('Delete user with non-existent ID', ...)` — inside the `DELETE` describe block, but it creates a real user and deletes it by its **real** id (that's a "delete existing user" test).
- Line 257: a second `it('Delete user with non-existent ID', ...)` — this one actually tests a non-existent id, and duplicates the title of the previous one verbatim. Two different scenarios sharing one title means a Mochawesome failure report can't tell you which one broke.

**5. Shared mutable test data at module scope** — `usuarios.cy.js:4-6` computes `name`/`email`/`password` once, at file load, and every `describe` block in the file reuses the *same* identity. If one block's cleanup (`after(() => cy.apagarUsuario(name))`) doesn't run (e.g. a prior failure), the next block's `POST /usuarios` fails with "email já está sendo usado" — a cascading failure that has nothing to do with the thing actually under test. Generate fresh data per test/block instead (the `userFactory` you already have does this for you).

**6. `signUp.cy.js` has no cleanup `after` hook** — unlike `login.cy.js` and `search.cy.js`, it only does `cy.apagarUsuario(user.name)` in `beforeEach` (cleaning up the *previous* run), never after its own run. Leftover `vanderlan` users accumulate until the next run cleans them.

## 🏗️ Architecture / pattern gaps

**Page Object Model exists but isn't used.** `cypress/pages/{Login,Cadastro,Home}.js` are dead code right now — every spec calls `cy.get('[data-testid=...]')` directly instead. This is the single biggest structural fix: once bug #1 above is fixed, route `login.cy.js`, `signUp.cy.js`, and `search.cy.js` through these classes. Benefits you're currently not getting: one place to fix a selector when the app changes, and specs read as intent (`Login.entrarButton().click()`) instead of markup.

**Data factories exist but are used inconsistently.** `search.cy.js` correctly uses `createUser()`/`createProduct()` from your factories — unique data per run, no collisions, no need for defensive pre-cleanup. `login.cy.js` and `signUp.cy.js` instead hardcode a static `vanderlan@ig.com` user, which is *why* those two specs need the `apagarUsuario` dance in `beforeEach` at all. Standardizing all three UI specs on the factories removes bug #5/#6's failure mode entirely and lets specs run in parallel safely.

**`cy.visit` mixes absolute and relative URLs.** `cypress.config.js` sets `baseUrl: 'https://front.serverest.dev/'`, and specs correctly call `cy.visit('/login')`. But the (unused) page objects hardcode the full URL (`cy.visit('https://front.serverest.dev/cadastrarusuarios')`). Fix this when you wire the page objects in, so `baseUrl` stays the single source of truth (e.g. for pointing tests at a different environment).

## 🔧 Smaller resilience improvements

- No `retries` configured in `cypress.config.js`. Since these tests hit a shared *public* demo instance you don't control, `retries: { runMode: 2 }` is a cheap way to absorb transient flakiness in CI without masking real regressions (mochawesome still shows the flaky ones as "retried").
- `search.cy.js:30` asserts on `.card-title` (a CSS class) rather than a `data-testid`, inconsistent with the `cypress/require-data-selectors` ESLint rule you already have configured (currently `warn`) elsewhere.
- `usuarios.cy.js` repeats `after(() => cy.apagarUsuario(name))` per `describe` block (3×) for the same static `name` — since it's the same identity throughout the file, one file-level `after` would do, and is one less thing to forget to add to a new block.

## Suggested priority order

1. Fix the unclosed selectors (#1) and wire specs through the Page Objects — that's one fix instead of three duplicated ones.
2. Fix the intercept-ordering bug (#2) and the `user.senha` typo (#3) — both are silent-failure/flakiness risks.
3. Rename the misleading test titles (#4) and dedupe them.
4. Standardize `login.cy.js`/`signUp.cy.js` on the factories, add `signUp.cy.js`'s missing `after` cleanup.
5. Add `retries` to `cypress.config.js`.

## Nota: 6.5/10

The instincts are right — Page Object Model, faker-based factories, custom Cypress commands for API setup/teardown, a real ESLint config scoped to Cypress rules, Mochawesome reporting, CI. That's more infrastructure than most Cypress suites at this stage bother with. What's holding it back is that the good patterns (POM, factories) are only *half* adopted — built but not consistently used — and a handful of concrete bugs (unclosed selectors, intercept-after-click, a typo'd property, mislabeled tests) slipped through, almost certainly because copy-paste between specs and page objects happened without either being exercised carefully. Fix the wiring gap and the review-listed bugs, and this jumps to an 8+.

---

## Follow-up review — 2026-09-01

Re-reviewed after the fixes from the section above. Good news first: the unclosed selectors, the late `cy.intercept`, the `user.senha` typo, and the hardcoded `vanderlan@ig.com` user are all fixed, and the unused Page Objects were removed instead of wired in, which resolves the "half adopted pattern" gap from a different direction than originally suggested, but resolves it. `login.cy.js` and `signUp.cy.js` now both build their user with `createUser()` per test.

### New bugs introduced during the rewrite

**1. `describe.only` in `cypress/e2e/api/usuarios.cy.js:116`.** This is currently hiding three whole describe blocks ("GET", "PUT", "DELETE") plus the standalone `it('Delete user with non-existent ID')` at the end of the file. None of them run right now. `login.cy.js:32` also has a stray `describe.only`, harmless today since it is the only top-level block in that file, but it is the same habit.

**2. `user is not defined` in the "PUT" (line 210) and "DELETE" (line 234) describe blocks of `usuarios.cy.js`.** Both reference `user.name/.password/.email`, but `user` was declared with `const`/`let` inside the sibling "GET" and "POST" describe callbacks, separate function scopes that do not leak out. This is currently masked by bug #1's `.only`. The moment `.only` is removed, both blocks throw `ReferenceError: user is not defined` before any `cy` command runs. Even fixed, the call shape is also wrong: `cy.criarUsuario(user.name, user.password, user.email, 'false')` passes four positional args into a command defined as `(user) => {...}`, one object. Should be `cy.criarUsuario(createUser())`.

**3. `eslint.config.mjs` would not catch either bug.** `npx eslint .` currently passes clean on a file containing a dead-coverage bug and a guaranteed crash. The config only extends `eslint-plugin-cypress`'s recommended rules, not base ESLint `recommended` (which provides `no-undef`), and has no rule enabled against committed `.only`. Fixing the config is higher leverage than fixing this one instance, since it prevents the whole category.

### Smaller items

- `search.cy.js:32` still asserts on `.card-title` (a CSS class) instead of `data-testid`, which the repo's own `cypress/require-data-selectors` rule already warns about.
- `commands.js` and `search.cy.js` hardcode `https://serverest.dev/...` in intercepts instead of using `Cypress.env('apiUrl')`, unlike `commandsApi.js`.
- `README.md` still documents the old Cucumber/`.feature`/`cypress/pages` architecture, none of which exists anymore.
- `.github/workflows/serverest-ci.yml` still points at `.feature` paths that were never real, so CI has likely never run a real test.

### Priority order

1. Remove both `describe.only` calls.
2. Fix the `user` reference and the `criarUsuario` call shape in PUT/DELETE.
3. Add base ESLint `recommended` (for `no-undef`) plus a no-committed-`.only` rule.
4. Rewrite `README.md` to match the real, current structure.
5. Fix the CI workflow's spec paths.

### Nota: 7/10

Real progress on everything the last review flagged, the fixes are clean, not just papered over. What holds this back from an 8+ is that a fresh, more dangerous bug replaced the old ones: `.only` silently dropping most of a file's coverage, sitting on top of two describe blocks that would crash outright if it were removed. The README and CI drift also still have not been touched, and for a portfolio project that is what a reviewer sees first.

---

## Architecture and patterns review — 2026-09-04

All bugs from the two prior passes are confirmed fixed: no `describe.only` remains in either file, the "PUT"/"DELETE" blocks in `usuarios.cy.js` now chain `.then()` with correct scoping, and `npx eslint .` returns clean (0 problems) with the `no-undef`/`no-only-tests` gate now in place.

This pass looks specifically at architecture and patterns rather than correctness.

### What is working well

- **Command layering.** `commands.js` (UI actions, `loginSession` cached via `cy.session()`) versus `commandsApi.js` (setup/teardown via `cy.request()`) is a clean separation, the same "App Actions" pattern used in the Cypress Real World App reference project.
- **Factories.** `createUser()`/`createProduct()` are now used consistently across all four spec files, fully resolving the "half adopted pattern" flagged in the first review.

### Gaps

**1. Test data cleanup is inconsistent, and the name-based path is a real collision risk.** `deleteUserById(id)` deletes by the exact id returned at creation time. `apagarUsuario(name)` instead does `GET /usuarios?nome=<name>` and deletes whatever comes back first. `userFactory.js` generates only a first name (`faker.person.firstName()`), no surname or unique suffix, on a public shared instance used by many other people studying Cypress at the same time. `search.cy.js`'s `after()` and `signUp.cy.js`'s `afterEach()` should switch from `apagarUsuario(user.name)` to `deleteUserById`, using the id already available from the creation response.

**2. UI form filling is duplicated instead of extracted into a command.** `login.cy.js` repeats the same three-line `cy.get(...).type(...)` sequence five times, `signUp.cy.js` repeats a similar sequence three times. Suggested:

```js
Cypress.Commands.add('fillLoginForm', (email, password) => {
    cy.get('[data-testid="email"]').should('be.visible').type(email)
    cy.get('[data-testid="senha"]').should('be.visible').type(password)
    cy.get('[data-testid="entrar"]').should('be.visible').click()
})
```

**3. Factory field naming is inconsistent between the two factories.** `userFactory` returns English keys (`name`, `administrator`), translated to Portuguese inside `commandsApi.js`. `product` already returns Portuguese keys (`nome`, `preco`) matching the API directly. Pick one convention for both.

**4. No `retries` in `cypress.config.js`**, despite every test hitting a shared public API. `retries: { runMode: 2 }` is a cheap way to absorb transient flakiness from an instance you do not control.

### Priority order

1. Switch all cleanup calls to `deleteUserById`.
2. Extract `fillLoginForm`/`fillSignupForm` commands.
3. Add `retries: { runMode: 2 }` to `cypress.config.js`.
4. Standardize factory field naming (English domain objects translated in one place, or both factories speak the API's shape directly).

### Nota: 8/10

Every bug from the last two reviews is confirmed fixed, and the lint gate now actively prevents two of them from returning. What is left is duplication (the repeated form-filling) and one real data-safety gap (name-based cleanup on a shared public instance), not correctness bugs. Closing the four items above would make this a clean, defensible reference project for interviews.

---

## Follow-up — 2026-09-04 (same day)

Fixed already: `signUp.cy.js`'s `afterEach` now deletes both `user.name` and `userAdmin.name`, closing the leak found in the previous entry. `eslint .` still clean.

### Nota: 8.5/10

No new bugs found. What remains is polish, not correctness: cleanup is still name-based rather than id-based across the UI specs, `commandsApi.js` still uses positional arguments while the UI commands use a single object, and `cypress.config.js`/`README.md`/the CI workflow are the same open items as before.
