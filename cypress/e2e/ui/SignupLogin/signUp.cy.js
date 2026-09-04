import { createUser, creatUserAdmin } from '../../../factories/userFactory.js'



// Given que o usuario "vanderlan" nao tenha sido criado anteriormente
// And esteja na tela de cadastro
// When preenche usuario "vanderlan" email "vanderlan@ig.com" e password "teste2"
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

    let user
    let userAdmin

    beforeEach(() => {

        user = createUser()
        userAdmin = creatUserAdmin()

        cy.visit('/cadastrarusuarios');
        cy.contains('Cadastro')
            .should('be.visible')
    });
    context('sucessful registration', () => {
        it('registers a new user successfully', () => {
            //Sign-up User
            cy.intercept('POST', '/login').as('login')
            cy.intercept('POST', '/usuarios').as('criarUsuario')

            cy.fillSignupForm(user)

            cy.wait('@criarUsuario')

            cy.contains('Cadastro realizado com sucesso')
                .should('be.visible')

            cy.wait('@login')
                .its('response.statusCode')
                .should('eq', 200)

            cy.contains('Serverest Store')
                .should('be.visible')

            cy.location('pathname').should('eq', '/home')
        });
        it('register a new administrator sucessfully', () => {

            cy.intercept('POST', '/usuarios').as('criarUsuario')
            cy.intercept('POST', '/login').as('login')

            cy.fillSignupForm(userAdmin)

            cy.wait('@criarUsuario')

            cy.contains('Cadastro realizado com sucesso')
                .should('be.visible')

            cy.wait('@login')
                .its('response.statusCode')
                .should('eq', 200)

            cy.contains(`Bem Vindo ${userAdmin.name}`)
                .should('be.visible')

            cy.location('pathname').should('eq', '/admin/home')
        });
        afterEach(() => {
            cy.apagarUsuario(userAdmin.name)
        })
    })
    context('form validation', () => {
        it('shows an error when the password is missing', () => {

            cy.fillSignupForm({ name: user.name, email: user.email })

            cy.contains("Password é obrigatório")
                .should('be.visible')
        });
        it('shows an error when the name is missing', () => {

            cy.fillSignupForm({ password: user.password, email: user.email })

            cy.contains("Nome é obrigatório")
                .should('be.visible')
        });
        it('show an error when the password is missing', () => {

            cy.fillSignupForm({ name: user.name, password: user.password })

            cy.contains("Email é obrigatório")
                .should('be.visible')
        });
    })
});

