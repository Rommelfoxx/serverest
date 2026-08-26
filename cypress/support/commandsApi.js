const BASE_URL = Cypress.env('apiUrl')

//login in the application
Cypress.Commands.add('loginApi', (email, password) => {
    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/login`,
        body: { email, password }
    }).then((response) => {
        return response.body.authorization
    })
})
//Apagar usuario informando nome 
Cypress.Commands.add('apagarUsuario', (userName) => {
    return cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios?nome=${userName}`,
        failOnStatusCode: false
    }).then((response) => {
        const usuarios = response.body?.usuarios
        if (usuarios && usuarios.length > 0) {
            return cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/usuarios/${response.body.usuarios[0]._id}`,
                failOnStatusCode: false
            })
        }
        cy.log(`Usuário "${userName}" não encontrado, nada a deletar.`)
    })
})
//Consultar usuario informando nome 
Cypress.Commands.add('consultarUsuario', (userName) => {
    return cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios?nome=${userName}`
    }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.usuarios[0]).to.have.property("nome", `${userName}`)
    })
})
//Criar usuario
Cypress.Commands.add('criarUsuario', (nome, password, email, administrador) => {
    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: { nome, email, password, administrador }
    }).then((response) => {
        expect(response.status).to.eq(201)
    })
})
Cypress.Commands.add('criarProduto', (email, password, nome, preco, descricao, quantidade) => {
    cy.loginApi(email, password).then((auth) => {
        return cy.request({
            method: 'POST',
            url: `${BASE_URL}/produtos`,
            headers: { 'authorization': auth },
            body: { nome, preco, descricao, quantidade }
        }).then((response) => {
            expect(response.status).to.eq(201)
        })
    })
})
Cypress.Commands.add('excluirProduto', (email, password, id) => {
    cy.loginApi(email, password).then((auth) => {
        return cy.request({
            method: 'DELETE',
            headers: { 'authorization': auth },
            url: `${BASE_URL}/produtos/${id}`
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })
})



