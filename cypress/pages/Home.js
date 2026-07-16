class Home {
    
     menuHomeButton() {return cy.get('[data-testid=home')}
     menuListaDeComprasButton() {return cy.get('[data-testid=lista-de-compras')}
     menuCarrinhoButton() {return cy.get('[data-testid=carrinho')}
     logoutButton() {return cy.get('[data-testid=logout')}

}

export default new Home