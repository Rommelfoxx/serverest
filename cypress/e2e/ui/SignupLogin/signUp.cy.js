import { createUser, createUserAdmin } from '../../../factories/userFactory.js'

describe('User Sign-up and Login', () => {

    let user
    let userAdmin

    beforeEach(() => {

        user = createUser()
        userAdmin = createUserAdmin()

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
            cy.apagarUsuario(user.name)
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

