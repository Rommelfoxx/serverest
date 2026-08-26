// Feature: logar na aplicação
//   Scenario: Logar na aplicação com usuario não administrador com sucesso
//     Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "false" cadastrado
//     And esteja na tela de login
//     When preenche email "van@gmail.com" e senha "teste123"
//     And clica no bottão Entrar
//     Then somos direcionados para home
//   Scenario: Logar na aplicação com usuario não administrador com sucesso
//     Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "true" cadastrado
//     And esteja na tela de login
//     When preenche email "van@gmail.com" e senha "teste123"
//     And clica no bottão Entrar
//     Then somos direcionados para home com perfil ADM


//   Scenario Outline: Logar na aplicação com usuario incorreto
//     Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "true" cadastrado
//     And esteja na tela de login
//     When preenche email "<email>" e senha "<senha>"
//     And clica no bottão Entrar
//     Then é apresentada "<mensagem>" de erro

//     Examples:
//       | email             | senha    | mensagem                   |
//       | van@gmail.com     | teste    | Email e/ou senha inválidos |
//       | vanaaaa@gmail.com | teste123 | Email e/ou senha inválidos |
//       |                   | teste123 | Email é obrigatório        |
//       | vanaaaa@gmail.com |          | Password é obrigatório     |

describe('login on the application', () => {
    const user = {
        name: 'vanderlan',
        email: 'vanderlan@ig.com',
        password: 'teste2'
    }
    //Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "false" cadastrado
    //And esteja na tela de login
    beforeEach(() => {
        cy.apagarUsuario(user.name)
        cy.visit('/login');
        cy.contains('Login').should('be.exist')
        cy.criarUsuario(user.name, user.password, user.email, 'false')
    })

    it('Successful login', () => {
        //When preenche email "van@gmail.com" e senha "teste123"
        //And clica no bottão Entrar
        cy.get('[data-testid="email"]').should("be.visible").type(user.email)
        cy.get('[data-testid="senha"]').should('be.visible').type(user.password)
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then we are redirected to the to the home page
        cy.contains('Serverest Store').should('be.exist')
    })
    it('incorrect email', () => {
        //When fill with incorrect email and correct password
        cy.get('[data-testid="email"]').should("be.visible").type('vams@asd.com.fr')
        cy.get('[data-testid="senha"]').should('be.visible').type(user.password)
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then show the error message 
        cy.contains('Email e/ou senha inválidos').should('be.exist')
    })
    it('incorrect password', () => {
        //When fill with incorrect password and correct email
        cy.get('[data-testid="email"]').should("be.visible").type(user.email)
        cy.get('[data-testid="senha"]').should('be.visible').type('12345')
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then show the error message 
        cy.contains('Email e/ou senha inválidos').should('be.exist')
    })
    it('fill empty password', () => {
        //When fill with empty password and correct email
        cy.get('[data-testid="email"]').should("be.visible").type(user.email)
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then show the error message 
        cy.contains('Password é obrigatório').should('be.exist')
    })

    it('fill empty email', () => {
        //When fill with empty email and correct password
        cy.get('[data-testid="senha"]').should('be.visible').type(user.password)
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then show the error message 
        cy.contains('Email é obrigatório').should('be.exist')
    })

    after(() => {
        cy.apagarUsuario(user.name)
    })
})
