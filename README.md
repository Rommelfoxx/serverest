# front-serverest

Suíte de automação de testes (Cypress + Cucumber/Gherkin) para o [ServeRest](https://serverest.dev) — uma aplicação de e-commerce fake mantida para prática de QA.

Os testes rodam contra a aplicação pública hospedada em `https://front.serverest.dev` (UI) e `https://serverest.dev` (API) — não há backend nem frontend local neste repositório, apenas os testes.

## Stack

- [Cypress](https://www.cypress.io/) `15.x`
- [@badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor) — specs em Gherkin (`.feature`) com step definitions em JS
- [esbuild](https://esbuild.github.io/) — bundler dos specs via `@bahmutov/cypress-esbuild-preprocessor`
- [Mochawesome](https://github.com/adamgruber/mochawesome) — relatório de execução (HTML + resumo no GitHub Actions)

## Estrutura

```
cypress/
├── e2e/
│   ├── api/
│   │   └── usuarios/
│   │       ├── usuarios.feature       # cenários de API para /usuarios
│   │       └── steps/usuarios.js
│   └── ui/
│       ├── cadastrarLogin/
│       │   ├── cadastrarLogin.feature # cadastro de usuário via UI
│       │   └── steps/cadastrarLogin.js
│       └── logar/
│           ├── login.feature          # login via UI
│           └── steps/login.js
├── factories/
│   └── userFactory.js                 # gera dados de usuário únicos por execução
├── pages/                             # Page Objects (Cadastro, Login, Home)
├── support/
│   ├── commands.js                    # comandos customizados (criarUsuario, apagarUsuario, consultarUsuario)
│   └── e2e.js
└── fixtures/
```

Cada suíte segue o padrão `<feature>.feature` + `steps/<feature>.js`, conforme a convenção do `cypress-cucumber-preprocessor`.

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
| `npm run cypress:run` | Roda todas as specs `.feature` headless |
| `npm run cypress:api` | Roda só as specs de API (`cypress/e2e/api`) |
| `npm run cypress:e2e` | Roda só as specs de UI (`cypress/e2e/ui`) |

Para rodar uma spec específica:

```bash
npx cypress run --spec "cypress/e2e/ui/logar/login.feature"
```

## Relatórios

Os testes usam o reporter Mochawesome, configurado em `cypress.config.js` para gravar um JSON por spec em `cypress/reports/mocha/.jsons/`. Para gerar o relatório HTML consolidado:

```bash
npm run report:merge     # mescla os JSONs em cypress/reports/mocha/merged.json
npm run report:generate  # gera o HTML em cypress/reports/html/
```

## CI

O workflow `.github/workflows/serverest-ci.yml` roda em push para `main`/`dev` e em pull requests para `main`, com dois jobs paralelos:

- **test-api** — roda os testes de API (`usuarios.feature`)
- **test-ui** — roda os testes de UI (`cadastrarLogin.feature`, `login.feature`)

Ambos publicam o relatório Mochawesome como artifact, um resumo no `GITHUB_STEP_SUMMARY`, e screenshots/vídeos em caso de falha.

## Convenções

- Cada nova suíte deve ter seu `.feature` pareado com um arquivo de step definitions em `steps/` no mesmo diretório.
- Dados de usuário para testes devem ser gerados via `cypress/factories/userFactory.js` (nome/email únicos por timestamp) para evitar colisão entre execuções.
- Usuários criados durante os testes são removidos automaticamente ao final do cenário via hook `After`.
