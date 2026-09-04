import { createUser } from '../../../factories/userFactory.js'

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
    const user = createUser()
    beforeEach(() => {
        cy.visit('/login');
        cy.contains('Login').should('be.exist')
    })
    context('With a registered user', () => {
        before(() => {
            cy.criarUsuario(user)
        })
        it('logs in successfully', () => {

            cy.fillLoginForm({ email: user.email, password: user.password })
            //Then we are redirected to the to the home page
            cy.location('pathname')
                .should('eq', '/home')
            cy.contains('Serverest Store')
                .should('be.visible')
        })
        it('rejects an incorrect password', () => {

            cy.fillLoginForm({ email: user.email, password: '12345' })

            //Then show the error message 
            cy.contains('Email e/ou senha inválidos')
                .should('be.visible')
        })

    })
    context('validation', () => {
        it('rejects an incorrect email', () => {
            cy.fillLoginForm({ email: 'vams@asd.com.fr', password: user.password })
            //Then show the error message 
            cy.contains('Email e/ou senha inválidos')
                .should('be.visible')
        })
        it('rejects a fill empty password', () => {

            cy.fillLoginForm({ email: user.email })

            cy.contains('Password é obrigatório')
                .should('be.visible')
        })
        it('rejects a fill empty email', () => {

            cy.fillLoginForm({ password: user.password })

            cy.contains('Email é obrigatório')
                .should('be.visible')
        })
    })
    after(() => {
        cy.apagarUsuario(user.name)
    })

})


