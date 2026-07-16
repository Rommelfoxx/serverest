
const BASE_URL = Cypress.env('apiUrl')

//Apagar usuario informando nome 
Cypress.Commands.add('apagarUsuario', (userName) => {
  return cy.request({
    method: 'GET',
    url: `${BASE_URL}/usuarios?nome=${userName}`,
    failOnStatusCode: false
  }).then((response) =>{
    const usuarios = response.body?.usuarios
    
    if (usuarios && usuarios.length >0){
    return cy.request({
    method: 'DELETE',
    url: `${BASE_URL}/usuarios/${response.body.usuarios[0]._id}`,
    failOnStatusCode: false
    })
    }
    cy.log(`Usuário "${userName}" não encontrado, nada a deletar.`)
  })
})
//Consultar usuario informando nome 
Cypress.Commands.add('consultarUsuario', (userName) =>{
    return cy.request({
        method: 'GET',
        url:`${BASE_URL}/usuarios?nome=${userName}`
    }).then((response) =>{
        expect(response.status).to.eq(200)
        expect(response.body.usuarios[0]).to.have.property("nome",`${userName}`)
    })
})
//Criar usuario
Cypress.Commands.add('criarUsuario', (nome,password,email,administrador) =>{
    return cy.request({
        method: 'POST',
        url:`${BASE_URL}/usuarios`,
        body: { nome, email, password, administrador }
    }).then((response) =>{
        expect(response.status).to.eq(201)
    })
})