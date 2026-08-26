import { createUser } from '../../../factories/userFactory.js'
import { createProduct } from '../../../factories/product.js'



const user = createUser()
const product = createProduct()

let id
describe('Search for a product', () => {
    beforeEach(() => {
        cy.criarUsuario(user.name, user.password, user.email, 'true')
        cy.criarProduto(user.email, user.password, product.nome, product.preco, product.descricao, product.quantidade)
            .then((response) => {
                id = response.body._id
            })
        cy.loginSession(user.email, user.password)
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
})
after(() => {
    cy.excluirProduto(user.email, user.password, id)
    cy.apagarUsuario(user.name)

})