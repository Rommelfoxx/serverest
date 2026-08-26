


//Login in the aplication using session
Cypress.Commands.add('loginSession', (email, password) => {
    cy.session(['user', email], () => {
        cy.visit('/login')
        cy.intercept('POST', 'https://serverest.dev/login').as('login')
        cy.get('[data-testid="email"]').should("be.visible").type(email)
        cy.get('[data-testid="senha"]').should('be.visible').type(password)
        cy.get('[data-testid="entrar"]').should('be.visible').click()
        //Then we are redirected to the to the home page
        cy.wait('@login')

    })
})