# front-serverest

Suíte de automação de testes (Cypress — UI + API) para o [ServeRest](https://serverest.dev) — uma aplicação de e-commerce fake mantida para prática de QA.

Os testes rodam contra a aplicação pública hospedada em `https://front.serverest.dev` (UI) e `https://serverest.dev` (API) — não há backend nem frontend local neste repositório, apenas os testes.

## Stack

- [Cypress](https://www.cypress.io/) `15.x`
- [@faker-js/faker](https://fakerjs.dev/) — geração de dados de teste (usuários, produtos)
- [Mochawesome](https://github.com/adamgruber/mochawesome) — relatório de execução (HTML + resumo no GitHub Actions)

As specs são arquivos `*.cy.js` (Mocha `describe`/`it`), não Gherkin/Cucumber. Alguns cenários trazem comentários no estilo `Given/When/Then` em português apenas como documentação — eles não são interpretados como Gherkin.

## Estrutura

```
cypress/
├── e2e/
│   ├── api/
│   │   └── usuarios.cy.js             # testes de API para /usuarios (via cy.request)
│   └── ui/
│       ├── SignupLogin/
│       │   ├── login.cy.js            # login via UI
│       │   └── signUp.cy.js           # cadastro de usuário via UI
│       └── Home/
│           └── search.cy.js           # busca de produtos via UI
├── factories/
│   ├── userFactory.js                 # gera dados de usuário únicos por execução
│   └── product.js                     # gera dados de produto
├── support/
│   ├── commands.js                    # comandos de UI (loginSession via cy.session)
│   ├── commandsApi.js                 # comandos de API para setup/teardown (criarUsuario, apagarUsuario, criarProduto, excluirProduto, ...)
│   └── e2e.js
└── fixtures/
```

## Pré-requisitos

- Node.js 24+
- npm

## Instalação

```bash
npm ci
```

## Rodando os testes

| Comando | O que faz |
|---|---|
| `npx cypress open` | Abre o Test Runner interativo |
| `npm run cypress:run` | Roda todas as specs `.cy.js` headless |
| `npm run lint` | Lint no repositório inteiro |
| `npm run lint:cypress` | Lint apenas em `cypress/` |

Para rodar uma spec específica:

```bash
npx cypress run --spec "cypress/e2e/ui/SignupLogin/login.cy.js"
```

> `npm run cypress:api` / `npm run cypress:e2e` existem no `package.json` mas hoje não casam com nenhum arquivo (procuram por `*.feature`, que não existem no repo) — use `cypress:run` ou `--spec` diretamente.

## Relatórios

Os testes usam o reporter Mochawesome, configurado em `cypress.config.js` para gravar um JSON por spec em `cypress/reports/mocha/.jsons/`. Para gerar o relatório HTML consolidado:

```bash
npm run report:merge     # mescla os JSONs em cypress/reports/mocha/merged.json
npm run report:generate  # gera o HTML em cypress/reports/html/
```

## CI

O workflow `.github/workflows/serverest-ci.yml` roda em push para `main`/`dev` e em pull requests para `main`, com dois jobs paralelos:

- **test-api** — roda os testes de API (`cypress/e2e/api/usuarios.cy.js`)
- **test-ui** — roda os testes de UI (`SignupLogin/login.cy.js`, `SignupLogin/signUp.cy.js`, `Home/search.cy.js`)

Ambos publicam o relatório Mochawesome como artifact, um resumo no `GITHUB_STEP_SUMMARY`, e screenshots/vídeos em caso de falha.

## Convenções

- Dados de teste (usuários, produtos) devem ser gerados via `cypress/factories/` para evitar colisão entre execuções.
- Como os testes rodam contra a instância pública compartilhada do ServeRest, toda spec que cria usuário/produto precisa limpar o que criou (`apagarUsuario`/`excluirProduto` em `after`/`afterEach`) para não poluir o backend para outras execuções.
