import { createUser } from '../../../factories/user.js'

const apiUrl = Cypress.expose('apiUrl')


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
    context('Successful test', () => {
        it('Create a new user', () => {

            cy.request({
                method: 'POST',
                url: `${apiUrl}/usuarios`,
                body: {
                    nome: user.nome,
                    email: user.email,
                    password: user.password,
                    administrador: user.administrador
                }
            })
                .then(({ status, body }) => {

                    expect(status).to.eq(201)

                    expect(body)
                        .to.have.property(
                            "message",
                            "Cadastro realizado com sucesso"
                        )
                    expect(body._id)
                        .to.be.a("string")
                        .and.not.be.empty

                    user._id = body._id
                })
        })

    })
    //   Scenario: Não deve cadastrar usuário com email já utilizado
    //     Given que exista um usuario cadastrado
    //     When realizo uma requisição POST para cadastrar outro usuario com o mesmo email
    //     Then o status da resposta deve ser 400
    //     And a mensagem da resposta deve ser "Este email já está sendo usado"
    context('Error tests', () => {


        it('rejects an email that is already registered', () => {

            cy.criarUsuario(user)

            cy.request({
                method: 'POST',
                url: `${apiUrl}/usuarios`,
                body: {
                    nome: user.nome,
                    email: user.email,
                    password: user.password,
                    administrador: user.administrador
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
    })

    afterEach(() => {
        return cy.deleteUserById(user._id)
    })

})