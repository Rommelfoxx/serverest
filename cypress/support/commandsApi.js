const BASE_URL = Cypress.env('apiUrl')

//login in the application
Cypress.Commands.add('loginApi', (email, password) => {
    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/login`,
        body: {
            email,
            password
        }
    }).then((response) => {

        return response.body.authorization
    })
})

Cypress.Commands.add('criarUsuario', (user) => {

    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/usuarios`,
        body: {
            nome: user.name,
            email: user.email,
            password: user.password,
            administrador: user.administrator
        }
    }).then((response) => {

        expect(response.status).to.eq(201)

        return response
    })

})


Cypress.Commands.add('criarProduto', (email, password, product) => {

    return cy.loginApi(email, password)
        .then((auth) => {

            return cy.request({
                method: 'POST',
                url: `${BASE_URL}/produtos`,
                headers: { 'authorization': auth },
                body: {
                    nome: product.nome,
                    preco: product.preco,
                    descricao: product.descricao,
                    quantidade: product.quantidade
                }
            }).then((response) => {

                expect(response.status)
                    .to.eq(201)

                return response
            })
        })
})

Cypress.Commands.add('excluirProduto', (email, password, id) => {
    cy.loginApi(email, password)
        .then((auth) => {

            return cy.request({
                method: 'DELETE',
                headers: { 'authorization': auth },
                url: `${BASE_URL}/produtos/${id}`
            }).then((response) => {

                expect(response.status)
                    .to.eq(200)

                return response
            })
        })
})

//Apagar usuario informando nome 
Cypress.Commands.add('apagarUsuario', (userName) => {

    return cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios`,
        qs: {
            nome: userName
        },
        failOnStatusCode: false
    }).then((response) => {

        const usuarios = response.body?.usuarios

        if (usuarios?.length > 0) {

            return cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/usuarios/${usuarios[0]._id}`,
                failOnStatusCode: false
            })
        }
        cy.log(`Usuário "${userName}" não encontrado, nada a deletar.`)
    })
})

Cypress.Commands.add('deleteUserById', (id) => {

    return cy.request({
        method: 'DELETE',
        url: `${BASE_URL}/usuarios/${id}`,
        failOnStatusCode: false
    })
})

//Consultar usuario informando nome 
Cypress.Commands.add('consultarUsuario', (userName) => {
    return cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios`,
        qs: {
            nome: userName
        }
    }).then((response) => {

        expect(response.status)
            .to.eq(200)

        return response
    })
})

Cypress.Commands.add('searchUserById', (userId) => {
    return cy.request({
        method: 'GET',
        url: `${BASE_URL}/usuarios`,
        qs: {
            _id: userId
        }
    }).then((response) => {

        return response
    })
})




