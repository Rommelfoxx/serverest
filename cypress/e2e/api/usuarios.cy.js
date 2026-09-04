import { faker } from "@faker-js/faker";
import { createUser } from '../../factories/userFactory.js'

const apiUrl = Cypress.env('apiUrl')



describe('api usuarios tests GET', () => {
    const user = createUser()

    let userId

    it('List users', () => {
        cy.request({
            method: 'GET',
            url: `${apiUrl}/usuarios`
        }).then((response) => {

            const { usuarios, quantidade } = response.body

            expect(response.status)
                .to.eq(200)

            expect(usuarios)
                .to.be.an('array')
                .and.not.be.empty

            expect(quantidade)
                .to.be.a('number')
                .to.eq(usuarios.length)

            expect(usuarios[0])
                .to.include.all.keys(
                    'nome',
                    'email',
                    'password',
                    'administrador',
                    '_id')
        })
    })
    //   Scenario: Buscar usuário por ID com sucesso
    //     Given que exista um usuario cadastrado
    //     When realizo uma requisição GET para buscar o usuario pelo id
    //     Then o status da resposta deve ser 200
    //     And o usuario retornado deve ter o mesmo email do usuario cadastrado

    it('Retrieve user by ID', () => {
        cy.criarUsuario(user)
            .then((response) => {

                userId = response.body._id

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/usuarios`,
                    qs: {
                        _id: userId
                    }
                }).then((response) => {

                    const userResponse =
                        response.body.usuarios[0]

                    expect(response.status)
                        .to.eq(200)

                    expect(response.body.quantidade)
                        .to.eq(1)

                    expect(response.body.usuarios)
                        .to.have.length(1)

                    expect(userResponse._id)
                        .to.eq(userId)

                    expect(userResponse)
                        .to.include({
                            nome: user.name,
                            email: user.email,
                            password: user.password,
                            administrador: user.administrator
                        })
                })
            })
    });
    //   Scenario: Buscar usuário com ID inexistente
    //     When realizo uma requisição GET para buscar o usuario com o id "idInexistente123"
    //     Then o status da resposta deve ser 200
    //     And a mensagem da resposta deve ser "Usuário não encontrado"
    it('Returns no users for an unknown ID', () => {

        cy.request({
            method: 'GET',
            url: `${apiUrl}/usuarios`,
            qs: {
                _id: '2335rgtfgfhgf'
            }
        }).then((response) => {

            expect(response.status)
                .to.eq(200)

            expect(response.body)
                .to.property('quantidade', 0)

            expect(response.body.usuarios)
                .to.be.an('array')
                .and.have.length(0)
        })
    })
    after(() => {
        if (userId) {
            cy.deleteUserById(userId)
        }
    })
})
describe('Users API POST', () => {
    //   Scenario: Cadastrar usuário com sucesso
    //     Given que eu tenha os dados de um novo usuario
    //     When realizo uma requisição POST para cadastrar o usuario
    //     Then o status da resposta deve ser 201
    //     And a mensagem da resposta deve ser "Cadastro realizado com sucesso"
    let user

    beforeEach(() => {
        user = createUser()
    })

    it('Create a new user', () => {

        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            body: {
                nome: user.name,
                email: user.email,
                password: user.password,
                administrador: user.administrator
            }
        })
            .then((response) => {

                expect(response.status)
                    .to.eq(201)

                expect(response.body)
                    .to.have.property(
                        "message",
                        "Cadastro realizado com sucesso"
                    )

                expect(response.body._id)
                    .to.be.a("string")
                    .and.not.be.empty
            })
    })
    //   Scenario: Não deve cadastrar usuário com email já utilizado
    //     Given que exista um usuario cadastrado
    //     When realizo uma requisição POST para cadastrar outro usuario com o mesmo email
    //     Then o status da resposta deve ser 400
    //     And a mensagem da resposta deve ser "Este email já está sendo usado"
    it('rejects an email that is already registered', () => {
        cy.criarUsuario(user)

        cy.request({
            method: 'POST',
            url: `${apiUrl}/usuarios`,
            body: {
                nome: user.name,
                email: user.email,
                password: user.password,
                administrador: user.administrator
            },
            failOnStatusCode: false
        }).then((response) => {

            expect(response.status)
                .to.eq(400)

            expect(response.body)
                .to.have.property(
                    "message",
                    "Este email já está sendo usado"
                )

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
    const mandatoryFields = [
        {
            field: 'nome',
            message: 'nome é obrigatório'
        },
        {
            field: 'email',
            message: 'email é obrigatório'
        },
        {
            field: 'password',
            message: 'password é obrigatório'
        },
        {
            field: 'administrador',
            message: 'administrador é obrigatório'
        }
    ]
    mandatoryFields.forEach(({ field, message }) => {


        it(`rejects registration when ${field} is missing`, () => {

            const payload = {
                nome: user.name,
                email: user.email,
                password: user.password,
                administrador: user.administrator
            }
            delete payload[field]

            cy.request({
                method: 'POST',
                url: `${apiUrl}/usuarios`,
                failOnStatusCode: false,
                body: payload
            }).then((response) => {

                expect(response.status)
                    .to.eq(400)

                expect(response.body)
                    .to.have.property(
                        field,
                        message
                    )
            })
        })
    })
    afterEach(() => {
        cy.apagarUsuario(user.name)
    })

})
//   Scenario: Editar usuário com sucesso
//     Given que exista um usuario cadastrado
//     When realizo uma requisição PUT alterando o nome do usuario para "Usuario Editado"
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Registro alterado com sucesso"

describe('api usuarios tests PUT', () => {

    const user = createUser()

    let userId

    it('Updates a user successfully', () => {

        const updatedUser = {
            nome: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            administrador: 'true'
        }

        cy.criarUsuario(user)
            .then((response) => {

                userId = response.body._id

                return cy.request({
                    method: 'PUT',
                    url: `${apiUrl}/usuarios/${userId}`,
                    body: updatedUser
                })
            })
            .then((response) => {

                expect(response.status)
                    .to.eq(200)

                expect(response.body).to.have.property(
                    'message',
                    'Registro alterado com sucesso'
                )

                return cy.request({
                    method: 'GET',
                    url: `${apiUrl}/usuarios`,
                    qs: {
                        _id: userId
                    }
                })
            })
            .then((response) => {
                expect(response.status)
                    .to.eq(200)

                expect(response.body.quantidade)
                    .to.eq(1)

                const userResponse =
                    response.body.usuarios[0]

                expect(userResponse._id)
                    .to.eq(userId)

                expect(userResponse)
                    .to.include(updatedUser)
            })
    })
    afterEach(() => {
        if (userId) {
            cy.deleteUserById(userId)
        }
    })
})
//   Scenario: Deletar usuário com sucesso
//     Given que exista um usuario cadastrado
//     When realizo uma requisição DELETE para excluir o usuario cadastrado
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Registro excluído com sucesso"
describe('api usuarios tests DELETE', () => {

    const user = createUser()

    let userId
    it('Delete user', () => {

        cy.criarUsuario(user)
            .then((response) => {

                userId = response.body._id

                return cy.request({
                    method: 'DELETE',
                    url: `${apiUrl}/usuarios/${userId}`
                })
            })
            .then((response) => {

                expect(response.status)
                    .to.eq(200)

                expect(response.body)
                    .to.property(
                        "message",
                        "Registro excluído com sucesso"
                    )
                return cy.searchUserById(userId)
            })
            .then((response) => {

                expect(response.status)
                    .to.eq(200)

                expect(response.body.quantidade)
                    .to.eq(0)

                expect(response.body.usuarios)
                    .to.be.an('array')
                    .and.have.length(0)

            })
    })
    it('Returns no deletion for an unknown user ID', () => {

        const unknownUserId = 'unknownUser123'

        cy.request({
            method: 'DELETE',
            url: `${apiUrl}/usuarios/${unknownUserId}`
        }).then((response) => {

            expect(response.status)
                .to.eq(200)

            expect(response.body).to.property(
                "message",
                "Nenhum registro excluído"
            )
        })
    })

})
//   Scenario: Deletar usuário com ID inexistente
//     When realizo uma requisição DELETE para excluir o usuario com o id "idInexistente123"
//     Then o status da resposta deve ser 200
//     And a mensagem da resposta deve ser "Nenhum registro excluído"

