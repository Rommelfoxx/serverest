import { Given, When, Then, After } from '@badeball/cypress-cucumber-preprocessor'
import userFactory from '../../../../factories/userFactory'
const BASE_URL = Cypress.env('apiUrl')

let usuarioGerado
let usuarioCadastrado
let resposta

After(() => {
    if (usuarioCadastrado?._id) {
        cy.request({
            method: 'DELETE',
            url: `${BASE_URL}/usuarios/${usuarioCadastrado._id}`,
            failOnStatusCode: false
        })
    }
    usuarioGerado = null
    usuarioCadastrado = null
    resposta = null
})

Given('que eu tenha os dados de um novo usuario', () => {
    usuarioGerado = userFactory.createUser()
})

Given('que exista um usuario cadastrado', () => {
    usuarioGerado = userFactory.createUser()
    cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: usuarioGerado
    }).then((response) => {
        usuarioCadastrado = { ...usuarioGerado, _id: response.body._id }
    })
})

When('realizo uma requisição GET para listar os usuarios', () => {
    cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios`
    }).then((response) => { resposta = response })
})

When('realizo uma requisição POST para cadastrar o usuario', () => {
    cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: usuarioGerado,
        failOnStatusCode: false
    }).then((response) => {
        resposta = response
        if (response.status === 201) usuarioCadastrado = { ...usuarioGerado, _id: response.body._id }
    })
})

When('realizo uma requisição POST para cadastrar outro usuario com o mesmo email', () => {
    const duplicado = userFactory.createUser({ email: usuarioCadastrado.email })
    cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: duplicado,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

When('realizo uma requisição POST para cadastrar um usuario sem o campo {string}', (campo) => {
    const usuario = userFactory.createUser()
    delete usuario[campo]
    cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: usuario,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

When('realizo uma requisição GET para buscar o usuario pelo id', () => {
    cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios/${usuarioCadastrado._id}`,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

When('realizo uma requisição GET para buscar o usuario com o id {string}', (id) => {
    cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios/${id}`,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

When('realizo uma requisição PUT alterando o nome do usuario para {string}', (novoNome) => {
    const usuarioAlterado = { ...usuarioGerado, nome: novoNome }
    cy.request({
        method: 'PUT',
        url: `${BASE_URL}/usuarios/${usuarioCadastrado._id}`,
        body: usuarioAlterado,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

When('realizo uma requisição DELETE para excluir o usuario cadastrado', () => {
    cy.request({
        method: 'DELETE',
        url: `${BASE_URL}/usuarios/${usuarioCadastrado._id}`,
        failOnStatusCode: false
    }).then((response) => {
        resposta = response
        usuarioCadastrado = null
    })
})

When('realizo uma requisição DELETE para excluir o usuario com o id {string}', (id) => {
    cy.request({
        method: 'DELETE',
        url: `${BASE_URL}/usuarios/${id}`,
        failOnStatusCode: false
    }).then((response) => { resposta = response })
})

Then('o status da resposta deve ser {int}', (status) => {
    expect(resposta.status).to.eq(status)
})

Then('a mensagem da resposta deve ser {string}', (mensagem) => {
    expect(resposta.body.message).to.eq(mensagem)
})

Then('a resposta deve conter a lista de usuarios', () => {
    expect(resposta.body).to.have.property('quantidade')
    expect(resposta.body.usuarios).to.be.an('array')
})

Then('a resposta deve conter o campo {string} com a mensagem {string}', (campo, mensagem) => {
    expect(resposta.body).to.have.property(campo, mensagem)
})

Then('o usuario retornado deve ter o mesmo email do usuario cadastrado', () => {
    expect(resposta.body.email).to.eq(usuarioCadastrado.email)
})
