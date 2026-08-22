



// Given que o usuario "vanderlan" nao tenha sido criado anteriormente
// And esteja na tela de cadastro
// When preenche usuario "vanderlan" email "vanderlan@ig.com" e senha "teste2"
// And clica no bottão Cadastrar
// Then usuario "vanderlan" é criado com sucesso 
// And somos direcionados para home 

//   Scenario Outline: Cadastro de novo usuario com falha
//     Given esteja na tela de cadastro
//     When preenche usuario "<usuario>" email "<email>" e senha "<senha>"
//     And  clica no bottão Cadastrar
//     Then é apresentada "<mensagem>" de erro

//     Examples:
//       | usuario | email      | senha | mensagem                       |
//       | teste1  | test44@van | senha | Email deve ser um email válido |
//       |         | test44@van | senha | Nome é obrigatório             |
//       | teste1  | test44@van |       | Password é obrigatório         |
//       | teste1  |            | senha | Email é obrigatório            |


describe('User Sign-up and Login', () => {

    const user = {
        name: 'vanderlan',
        email: 'vanderlan@ig.com',
        senha: 'teste2'
    }
    // Given que o usuario "vanderlan" nao tenha sido criado anteriormente
    // And esteja na tela de cadastro
    beforeEach(() => {
        cy.apagarUsuario(user.name)
        cy.visit('/cadastrarusuarios');
        cy.contains('Cadastro').should('be.exist')
    });
    it('User sign-up new user', () => {

        //Sign-up User
        cy.get('[data-testid="nome"').should('exist').type(user.name)
        cy.get('[data-testid="email"').should('exist').type(user.email)
        cy.get('[data-testid="password"').should('exist').type(user.senha)
        //And clica no bottão Cadastrar
        cy.intercept('POST', 'https://serverest.dev/login').as('login')
        cy.get('[data-testid="cadastrar"').should('be.visible').click()
        //Then usuario "vanderlan" é criado com sucesso 
        cy.intercept('POST', 'https://serverest.dev/usuarios').as('criarUsuario')
        cy.wait('@criarUsuario')
        cy.contains('Cadastro realizado com sucesso').should('be.exist')
        cy.consultarUsuario(user.name)
        cy.wait('@login')
        //And somos direcionados para home 
        cy.contains('Serverest Store').should('be.exist')
    });
    it('User sign-up new admin user', () => {
        //Sign-up User
        cy.get('[data-testid="nome"]').should('exist').type(user.name)
        cy.get('[data-testid="email"]').should('exist').type(user.email)
        cy.get('[data-testid="password"]').should('exist').type(user.senha)
        cy.get('[data-testid="checkbox"]').should('exist').click()
        //And clica no bottão Cadastrar
        cy.intercept('POST', 'https://serverest.dev/login').as('login')
        cy.get('[data-testid="cadastrar"').should('be.visible').click()
        //Then usuario "vanderlan" é criado com sucesso 
        cy.intercept('POST', 'https://serverest.dev/usuarios').as('criarUsuario')
        cy.wait('@criarUsuario')
        cy.contains('Cadastro realizado com sucesso').should('be.exist')
        cy.consultarUsuario(user.name)
        cy.wait('@login')
        //And somos direcionados para home 
        cy.contains('Bem Vindo vanderlan').should('be.exist')
    });

    it('should display signup password error ', () => {
        cy.get('[data-testid="nome"').should('exist').type(user.name)
        cy.get('[data-testid="email"').should('exist').type(user.email)
        cy.get('[data-testid="cadastrar"').should('be.visible').click()
        cy.contains("Password é obrigatório").should('be.exist')
    });
    it('should display signup name error ', () => {
        cy.get('[data-testid="email"').should('exist').type(user.email)
        cy.get('[data-testid="password"').should('exist').type(user.senha)
        cy.get('[data-testid="cadastrar"').should('be.visible').click()
        cy.contains("Nome é obrigatório").should('be.exist')
    });
    it('should display signup email error', () => {
        cy.get('[data-testid="nome"').should('exist').type(user.name)
        cy.get('[data-testid="password"').should('exist').type(user.senha)
        cy.get('[data-testid="cadastrar"').should('be.visible').click()
        cy.contains("Email é obrigatório").should('be.exist')
    });

});