class Cadastro {
    //input 
    nameInputText() {return cy.get('[data-testid="nome"')}
    emailInputText() {return cy.get('[data-testid="email"')}
    passwordInputText() {return cy.get('[data-testid="password"')}
    //Chekbox
    administradorCheckbox() {return cy.get('[data-testid="checkbox"')}
    //Button 
    cadastrarButton() {return cy.get('[data-testid="cadastrar"')}
    entrarButton() {return cy.get('[data-testid="entrar"')}
    //visit
    visit() {
        cy.visit('https://front.serverest.dev/cadastrarusuarios')
    }
}

export default new Cadastro()