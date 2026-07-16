class Login {

    //Seletores 
    loginInputText() { return cy.get('[data-testid="email"]') }
    senhaInputText() { return cy.get('[data-testid="senha"]') }
    cadastreButton() { return cy.get('[data-testid="cadastrar"]') }
    entrarButton() { return cy.get('[data-testid="entrar"]') }
  

    visit() {
        cy.visit('https://front.serverest.dev/login')
    }

}

export default new Login()