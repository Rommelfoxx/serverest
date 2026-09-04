import { createUser } from '../../../factories/userFactory.js'
import { createProduct } from '../../../factories/product.js'



const user = createUser({
    administrator: 'true'
})
const product = createProduct()
let productID

describe('Search for a product', () => {
    before(() => {
        cy.criarUsuario(user)
        cy.criarProduto(
            user.email,
            user.password,
            product
        ).then((response) => {
            productID = response.body._id
        })
    })
    beforeEach(() => {
        cy.loginSession(
            user.email,
            user.password)
        cy.visit('/home')
        cy.contains('Serverest Store').should('be.exist')
    })
    it('Search for a product with success', () => {
        cy.intercept('GET', 'https://serverest.dev/produtos*').as('consulta')
        cy.get('[data-testid="pesquisar"]')
            .should('be.enabled')
            .type(product.nome)
        cy.get('[data-testid="botaoPesquisar"]').click()
        cy.wait('@consulta')
        cy.get('[data-testid ="product-detail-link"]')
            .parent()
            .find('.card-title')
            .should('have.text', product.nome)
    })

    after(() => {
        cy.excluirProduto(user.email, user.password, productID)
        cy.apagarUsuario(user.name)

    })
})
