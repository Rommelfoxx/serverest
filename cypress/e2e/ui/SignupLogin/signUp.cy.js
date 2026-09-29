import { createUser, createUserAdmin } from '../../../factories/user.js'

describe('User Sign-up and Login', () => {


    context('sucessful registration', () => {

        let user
        let userAdmin

        beforeEach(() => {
            user = createUser()
            userAdmin = createUserAdmin()

            cy.visit('/cadastrarusuarios');

            cy.contains('Cadastro')
                .should('be.visible')
        });

        afterEach(() => {
            cy.apagarUsuario(userAdmin.nome)
            cy.apagarUsuario(user.nome)
        })
        it('registers a new user successfully', () => {
            //Sign-up User
            cy.intercept('POST', '/login').as('login')
            cy.intercept('POST', '/usuarios').as('criarUsuario')

            cy.fillSignupForm(user)

            cy.wait('@criarUsuario')
                .its('response.statusCode')
                .should('eq', 201)

            cy.contains('Cadastro realizado com sucesso')
                .should('be.visible')

            cy.wait('@login')
                .its('response.statusCode')
                .should('eq', 200)

            cy.contains('Serverest Store')
                .should('be.visible')

            cy.location('pathname')
                .should('eq', '/home')
        });
        it('register a new administrator sucessfully', () => {

            cy.intercept('POST', '/usuarios').as('criarUsuario')
            cy.intercept('POST', '/login').as('login')

            cy.fillSignupForm(userAdmin)

            cy.wait('@criarUsuario')
                .its('response.statusCode')
                .should('eq', 201)

            cy.contains('Cadastro realizado com sucesso')
                .should('be.visible')

            cy.wait('@login')
                .its('response.statusCode')
                .should('eq', 200)

            cy.contains(`Bem Vindo ${userAdmin.nome}`)
                .should('be.visible')

            cy.location('pathname')
                .should('eq', '/admin/home')
        });

    })
    context('form validation', () => {

        let user

        beforeEach(() => {

            user = createUser()

            cy.visit('/cadastrarusuarios')

            cy.contains('Cadastro')
                .should('be.visible')

        })

        const requiredFields = [
            {
                field: 'nome',
                message: 'Nome é obrigatório'
            },
            {
                field: 'email',
                message: 'Email é obrigatório'
            },
            {
                field: 'password',
                message: 'Password é obrigatório'
            }
        ]
        requiredFields.forEach((validation) => {

            it(`shows an error when the ${validation.field} is missing`, () => {

                const formData = {

                    nome: user.nome,
                    email: user.email,
                    password: user.password
                }

                delete formData[validation.field]

                cy.fillSignupForm(formData)

                cy.contains(validation.message)
                    .should('be.visible')
            });
        })


    })

});

