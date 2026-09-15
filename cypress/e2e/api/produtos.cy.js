import { createUserAdmin } from '../../factories/userFactory.js'
import { createProduct } from '../../factories/product.js'

const apiUrl = Cypress.expose('apiUrl')

describe('API product tests GET method', () => {

    const user = createUserAdmin()
    const product = createProduct()

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


    it('Returns all products', () => {
        return cy.request({
            url: `${apiUrl}/produtos`,
            method: 'GET'
        }).then(({ status, body }) => {

            expect(status)
                .to.eq(200)

            expect(body.produtos)
                .to.be.an('array')

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

                expect(produto.quantidade)
                    .to.be.a('number')
                    .and.be.at.least(0)

                expect(body.quantidade)
                    .to.eq(body.produtos.length)

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

    after(() => {

        cy.excluirProduto(
            user.email,
            user.password,
            product._id
        )

        cy.deleteUserById(user._id)
    })

})