import { createUserAdmin } from '../../../factories/userFactory.js'
import { createProduct, createInvalidProduct, createInconsistentProduct } from '../../../factories/product.js'



describe('API product tests GET method', () => {

    const apiUrl = Cypress.expose('apiUrl')
    const user = createUserAdmin()
    const product = createProduct()
    const invalidProduct = createInvalidProduct()
    const inconsistentProduct = createInconsistentProduct()

    before(() => {
        return cy.criarUsuario(user)
            .then(({ status, body }) => {
                expect(status).to.eq(201)
                user._id = body._id

                return cy.criarProduto(
                    user.email,
                    user.password,
                    product
                )
            })
            .then(({ status, body }) => {
                expect(status).to.eq(201)
                product._id = body._id
            })
    })

    context('Successful searches', () => {
        it('Returns all products', () => {
            return cy.request({
                url: `${apiUrl}/produtos`,
                method: 'GET'
            }).then(({ status, body }) => {

                expect(status)
                    .to.eq(200)

                expect(body.produtos)
                    .to.be.an('array')

                expect(body.quantidade)
                    .to.eq(body.produtos.length)

                expect(body.quantidade)
                    .to.be.a('number')
                    .and.be.at.least(0)


                body.produtos.forEach((produto) => {
                    expect(produto).to.include.all.keys(
                        'nome',
                        'preco',
                        'descricao',
                        'quantidade',
                        '_id'
                    )
                    expect(produto.nome)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(produto.preco)
                        .to.be.a('number')
                        .to.be.at.least(1)

                    expect(produto.descricao)
                        .to.be.a('string')
                        .and.not.be.empty

                    expect(produto._id)
                        .to.be.a('string')
                        .and.not.be.empty
                })
            })

        })
        const filters = [
            { field: '_id', value: () => product._id },
            { field: 'nome', value: () => product.nome },
            { field: 'preco', value: () => product.preco },
            { field: 'descricao', value: () => product.descricao },
            { field: 'quantidade', value: () => product.quantidade }
        ]

        filters.forEach(({ field, value }) => {
            it(`Search products by ${field}`, () => {
                const expectedValue = value()

                return cy.request({
                    method: 'GET',
                    url: `${apiUrl}/produtos`,
                    qs: {
                        [field]: expectedValue
                    }
                }).then(({ status, body }) => {
                    expect(status).to.eq(200)

                    expect(body.quantidade)
                        .to.be.an('number')

                    expect(body.produtos)
                        .to.be.an('array')
                        .and.not.be.empty

                    expect(body.quantidade)
                        .to.eq(body.produtos.length)

                    body.produtos.forEach((returnedProduct) => {
                        expect(returnedProduct[field])
                            .to.eq(expectedValue)
                    })

                    const createdProduct = body.produtos.find(
                        ({ _id }) => _id === product._id
                    )

                    expect(
                        createdProduct,
                        'The created product should appear in the results'
                    ).to.exist

                    expect(createdProduct).to.include({
                        nome: product.nome,
                        preco: product.preco,
                        descricao: product.descricao,
                        quantidade: product.quantidade,
                        _id: product._id
                    })

                    if (field === '_id') {
                        expect(body.quantidade).to.eq(1)
                    }
                })
            })
        })
        it('Searches products by name and price', () => {
            return cy.request({
                method: 'GET',
                url: `${apiUrl}/produtos`,
                qs: {
                    nome: product.nome,
                    preco: product.preco
                }
            }).then(({ status, body }) => {
                expect(status).to.eq(200)
                expect(body.produtos).to.not.be.empty

                body.produtos.forEach((returnedProduct) => {
                    expect(returnedProduct.nome).to.eq(product.nome)
                    expect(returnedProduct.preco).to.eq(product.preco)
                })
            })
        })
    })
    context('Search with nonexistent values', () => {

        const filters = [
            { field: '_id', value: () => invalidProduct._id },
            { field: 'nome', value: () => invalidProduct.nome },
            { field: 'preco', value: () => invalidProduct.preco },
            { field: 'descricao', value: () => invalidProduct.descricao },
            { field: 'quantidade', value: () => invalidProduct.quantidade }

        ]


        filters.forEach(({ field, value }) => {
            it(`Returns no products when searching by ${field}`, () => {
                const expectedValue = value()

                return cy.request({
                    url: `${apiUrl}/produtos`,
                    method: 'GET',
                    qs: {
                        [field]: expectedValue
                    }
                }).then(({ status, body }) => {
                    expect(status).to.eq(200)
                    expect(body.quantidade).to.eq(0)

                    expect(body.produtos)
                        .to.be.an('array')
                        .and.be.empty

                    expect(body.quantidade)
                        .to.eq(body.produtos.length)

                })

            })

        })

    })
    context('Searches with inconsistent values', () => {

        const filters = [
            {
                field: 'preco',
                value: () => inconsistentProduct.preco,
                expectedMessage: 'preco deve ser um número positivo'
            },
            {
                field: 'quantidade',
                value: () => inconsistentProduct.quantidade,
                expectedMessage: 'quantidade deve ser maior ou igual a 0'
            }
        ]
        filters.forEach(({ field, value, expectedMessage }) => {
            it(`Returns an error for an invalid ${field}`, () => {
                const expectedValue = value()

                return cy.request({
                    method: 'GET',
                    url: `${apiUrl}/produtos`,
                    qs: {
                        [field]: expectedValue
                    },
                    failOnStatusCode: false
                }).then(({ status, body }) => {
                    expect(status).to.eq(400)
                    expect(body).to.have.property(
                        field,
                        expectedMessage
                    )
                })

            })
        })

    })
    after(() => {
        cy.excluirProduto(
            user.email,
            user.password,
            product._id
        )
        cy.deleteUserById(user._id)
    })
})