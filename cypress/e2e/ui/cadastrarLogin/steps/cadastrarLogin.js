import { Given, When, Then, AfterAll } from '@badeball/cypress-cucumber-preprocessor'
import Cadastro from '../../../../pages/Cadastro'


Given('que o usuario {string} nao tenha sido criado anteriormente', (usuario) => {
    cy.apagarUsuario(usuario)
})

Given('esteja na tela de cadastro', () => {
    Cadastro.visit()
    cy.contains('Cadastro').should('be.exist')
})

When('preenche usuario {string} email {string} e senha {string}', (usuario, email, senha) => {
    if (usuario) Cadastro.nameInputText().should('be.exist').type(usuario)
    if (email) Cadastro.emailInputText().should('be.exist').type(email)
    if (senha) Cadastro.passwordInputText().should('be.exist').type(senha)
})

When('clica no bottão Cadastrar', () => {
     cy.intercept('POST','https://serverest.dev/login').as('login')
    Cadastro.cadastrarButton().should('be.exist').click()
})

Then('usuario {string} é criado com sucesso', (nome) =>{
     cy.intercept('POST','https://serverest.dev/usuarios').as('criarUsuario')
     cy.wait('@criarUsuario')
     cy.contains('Cadastro realizado com sucesso').should('be.exist')
     cy.consultarUsuario(nome)
      cy.wait('@login')
})
Then('somos direcionados para home',() =>{
    cy.contains('Serverest Store').should('be.exist')
})

Then ('é apresentada {string} de erro',(message) =>{
     cy.contains(message).should('be.exist')
})