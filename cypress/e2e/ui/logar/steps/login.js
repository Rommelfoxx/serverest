import { Given, When, Then, After } from '@badeball/cypress-cucumber-preprocessor'
import Login from '../../../../pages/Login.js'

let usuarioCriado

Given('que possua um usuario {string} senha {string} e email {string} se é administrador {string} cadastrado', (nome, password, email, administrador) => {
    cy.apagarUsuario(nome)
    usuarioCriado = nome
    cy.criarUsuario(nome, password, email, administrador)
})
Given('esteja na tela de login', () => {
    Login.visit()
    cy.contains('Login')
})

When('preenche email {string} e senha {string}', (email, password) => {
    if (email) Login.loginInputText().type(email)
    if (password) Login.senhaInputText().type(password)
})
When('clica no bottão Entrar', () => {
    cy.intercept('POST', 'https://serverest.dev/login').as('logarUsuario')
    Login.entrarButton().click()
    cy.wait('@logarUsuario')
})
Then('somos direcionados para home com perfil ADM', () => {
    cy.contains('Este é seu sistema para administrar seu ecommerce.').should('be.exist')
})


After(() => {
    cy.apagarUsuario(usuarioCriado)

})