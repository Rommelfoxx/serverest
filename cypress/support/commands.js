


//Login in the aplication using session
Cypress.Commands.add('loginSession', ({ email, password } = {}) => {
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

Cypress.Commands.add('fillLoginForm', ({ email, password } = {}) => {

    if (email) {
        cy.get('[data-testid="email"]').should('be.visible').type(email)
    }

    if (password) {
        cy.get('[data-testid="senha"]').should('be.visible').type(password)
    }

    cy.get('[data-testid="entrar"]').should('be.visible').click()

})

Cypress.Commands.add('fillSignupForm', ({ name, email, password, administrator } = {}) => {

    if (name) {

        cy.get('[data-testid="nome"]')
            .should('be.visible')
            .type(name)
    }

    if (email) {

        cy.get('[data-testid="email"]')
            .should('be.visible')
            .type(email)
    }

    if (password) {

        cy.get('[data-testid="password"]')
            .should('be.visible')
            .type(password)
    }
    if (administrator === 'true') {

        cy.get('[data-testid="checkbox"]')
            .should('be.visible')
            .click()
    }



    cy.get('[data-testid="cadastrar"]')
        .should('be.visible')
        .click()


})