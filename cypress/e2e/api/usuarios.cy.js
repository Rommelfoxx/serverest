import { faker } from "@faker-js/faker";

const apiUrl = Cypress.env('apiUrl')
const name = faker.person.fullName()
const email = faker.internet.email()
const password = faker.internet.password()
describe('api usuarios tests GET', () => {
    //   Scenario: Listar usuários com sucesso
    //     When realizo uma requisição GET para listar os usuarios
    //     Then o status da resposta deve ser 200
    //     And a resposta deve conter a lista de usuarios
    it('Listar usuários com sucesso', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/usuarios`
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.usuarios).to.be.an('array')
            expect(response.body.quantidade).to.be.a('number')
            expect(response.body.usuarios[0]).to.include.all.keys('nome', 'email', 'password', 'administrador', '_id')
        })
    })
    //   Scenario: Buscar usuário por ID com sucesso
    //     Given que exista um usuario cadastrado
    //     When realizo uma requisição GET para buscar o usuario pelo id
    //     Then o status da resposta deve ser 200
    //     And o usuario retornado deve ter o mesmo email do usuario cadastrado

    it('Successfully retrieve user by ID', () => {

        let id
        cy.criarUsuario(name, password, email, 'false').then((response) => {
            id = response.body._id

            return cy.request({
                method: 'GET',
                url: `${apiUrl}/usuarios`,
                qs: { _id: id }
            }).then((response) => {
                const user = response.body.usuarios[0]
                expect(response.status).to.eq(200)
                expect(user).to.include({
                    nome: name,
                    email: email,
                    password: password,
                    administrador: 'false'
                })
            })
        })
    });
    //   Scenario: Buscar usuário com ID inexistente
    //     When realizo uma requisição GET para buscar o usuario com o id "idInexistente123"
    //     Then o status da resposta deve ser 400
    //     And a mensagem da resposta deve ser "Usuário não encontrado"
    it('Search for a user with a non-existent ID', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/usuarios`,
            qs: { _id: '2335rgtfgfhgf' }
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.property('quantidade', 0)
            expect(response.body).to.property('usuarios')
        })
    })
    after(() => {
        cy.apagarUsuario(name)
    })
})
describe('api usuarios tests POST', () => {
    //   Scenario: Cadastrar usuário com sucesso
    //     Given que eu tenha os dados de um novo usuario
    //     When realizo uma requisição POST para cadastrar o usuario
    //     Then o status da resposta deve ser 201
    //     And a mensagem da resposta deve ser "Cadastro realizado com sucesso"
    it('Create a new user', () => {
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            body: {
                "nome": `${name}`,
                "email": `${email}`,
                "password": `${password}`,
                "administrador": "false"
            }
        }).then((response) => {
            expect(response.status).to.eq(201)
            expect(response.body).to.property("message", "Cadastro realizado com sucesso")
            expect(response.body).to.property("_id")
            cy.apagarUsuario(name)
        })
    })
    //   Scenario: Não deve cadastrar usuário com email já utilizado
    //     Given que exista um usuario cadastrado
    //     When realizo uma requisição POST para cadastrar outro usuario com o mesmo email
    //     Then o status da resposta deve ser 400
    //     And a mensagem da resposta deve ser "Este email já está sendo usado"
    it('Do not register a user with an email that is already in use', () => {
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            body: {
                "nome": `${name}`,
                "email": `${email}`,
                "password": `${password}`,
                "administrador": "false"
            }
        }).then((response) => {
            expect(response.status).to.eq(201)
            expect(response.body).to.property("message", "Cadastro realizado com sucesso")
            expect(response.body).to.property("_id")
            cy.request({
                method: 'POST',
                url: `${apiUrl}/usuarios`,
                body: {
                    "nome": `${name}`,
                    "email": `${email}`,
                    "password": `${password}`,
                    "administrador": "false"
                },
                failOnStatusCode: false
            }).then((response2) => {
                expect(response2.status).to.eq(400)
                expect(response2.body).to.property("message", "Este email já está sendo usado")
            })
            cy.apagarUsuario(name)
        })
    })

    //   Scenario Outline: Não deve cadastrar usuário com campo obrigatório ausente
    //     When realizo uma requisição POST para cadastrar um usuario sem o campo "<campo>"
    //     Then o status da resposta deve ser 400
    //     And a resposta deve conter o campo "<campo>" com a mensagem "<mensagem>"

    //     Examples:
    //       | campo         | mensagem                    |
    //       | nome          | nome é obrigatório          |
    //       | email         | email é obrigatório         |
    //       | password      | password é obrigatório      |
    //       | administrador | administrador é obrigatório |

    it('A user should not be registered if a mandatory field is missing', () => {
        //without administrador 
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            failOnStatusCode: false,
            body: {
                "nome": `${name}`,
                "email": `${email}`,
                "password": `${password}`,
            }
        }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body).to.property('administrador', 'administrador é obrigatório')
        })
        //without name 
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            failOnStatusCode: false,
            body: {
                "email": `${email}`,
                "password": `${password}`,
                "administrador": "true"
            }
        }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body).to.property('nome', 'nome é obrigatório')
        })
        //without password 
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            failOnStatusCode: false,
            body: {
                "nome": `${name}`,
                "email": `${email}`,
                "administrador": "true"
            }
        }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body).to.property('password', 'password é obrigatório')
        })

        //without email 
        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            failOnStatusCode: false,
            body: {
                "nome": `${name}`,
                "password": `${password}`,
                "administrador": "true"
            }
        }).then((response) => {
            expect(response.status).to.eq(400)
            expect(response.body).to.property('email', 'email é obrigatório')
        })
    })

    after(() => {
        cy.apagarUsuario(name)
    })
})
//   Scenario: Editar usuário com sucesso
//     Given que exista um usuario cadastrado
//     When realizo uma requisição PUT alterando o nome do usuario para "Usuario Editado"
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Registro alterado com sucesso"

describe('api usuarios tests PUT', () => {

    it('Successfully delete user', () => {
        cy.criarUsuario(name, password, email, 'false').then((response) => {
            let id = response.body._id
            cy.request({
                method: 'PUT',
                url: `${apiUrl}/usuarios/${id}`,
                body: {
                    "nome": "Fulano da Silva",
                    "email": faker.internet.email(),
                    "password": "teste",
                    "administrador": "true"
                }
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.message).to.eq('Registro alterado com sucesso')
                cy.apagarUsuario("Fulano da Silva")
            })
        })
    })
})
//   Scenario: Deletar usuário com sucesso
//     Given que exista um usuario cadastrado
//     When realizo uma requisição DELETE para excluir o usuario cadastrado
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Registro excluído com sucesso"
describe('api usuarios tests DELETE', () => {
    it('Delete user with non-existent ID', () => {
        cy.criarUsuario(name, password, email, 'false').then((response) => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `${apiUrl}/usuarios/${id}`
            }).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body).to.property("message", "Registro excluído com sucesso")
            })
        })
    })
})
//   Scenario: Deletar usuário com ID inexistente
//     When realizo uma requisição DELETE para excluir o usuario com o id "idInexistente123"
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Nenhum registro excluído"
it('Delete user with non-existent ID', () => {
    cy.request({
        method: 'DELETE',
        url: `${apiUrl}/usuarios/23432fghhfg`
    }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.property("message", "Nenhum registro excluído")
    })
})

