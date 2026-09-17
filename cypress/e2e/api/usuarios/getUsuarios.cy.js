
import { createUser } from '../../../factories/userFactory.js'

const apiUrl = Cypress.expose('apiUrl')

describe('api usuarios tests GET', () => {
    const user = createUser()

    before(() => {

        cy.criarUsuario(user)
            .then(({ status, body }) => {
                expect(status).to.eq(201)
                user._id = body._id
            })
    })

    context('Sucessful searches', () => {

        it('List all users', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/usuarios`
            }).then(({ status, body }) => {

                const { usuarios, quantidade } = body

                expect(status)
                    .to.eq(200)

                expect(usuarios)
                    .to.be.an('array')
                    .and.not.be.empty

                expect(quantidade)
                    .to.be.a('number')
                    .to.eq(usuarios.length)

                usuarios.forEach((usuarios) => {
                    expect(usuarios).to.include.all.keys(
                        'nome',
                        'email',
                        'password',
                        'administrador',
                        '_id'
                    )
                    expect(usuarios.nome)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(usuarios.email)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(usuarios.password)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(usuarios.administrador)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(usuarios._id)
                        .to.be.a('string')
                        .to.not.be.empty
                })
            })
        })
        //   Scenario: Buscar usuário por ID com sucesso
        //     Given que exista um usuario cadastrado
        //     When realizo uma requisição GET para buscar o usuario pelo id
        //     Then o status da resposta deve ser 200
        //     And o usuario retornado deve ter o mesmo email do usuario cadastrado

        const filters = [

            { field: '_id', value: () => user._id },
            { field: 'nome', value: () => user.nome },
            { field: 'email', value: () => user.email },
            { field: 'password', value: () => user.password },
            { field: 'administrador', value: () => user.administrador }

        ]

        filters.forEach(({ field, value }) => {
            it(`Retrieve user by ${field}`, () => {

                const expectedValue = value()

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/usuarios`,
                    qs: {
                        [field]: expectedValue
                    }
                }).then(({ status, body }) => {

                    const { quantidade, usuarios } = body

                    // const userResponse =
                    //     response.body.usuarios[0]

                    expect(status)
                        .to.eq(200)

                    if ([field] == '_id') {
                        expect(quantidade)
                            .to.eq(1)

                        expect(usuarios)
                            .to.have.length(1)
                    }

                    usuarios.forEach((returnedValue) => {
                        expect(returnedValue[field])
                            .to.eq(expectedValue)

                        const createdUser = usuarios.find(
                            ({ _id }) => _id === user._id
                        )
                        expect(createdUser)
                            .to.include({
                                nome: user.nome,
                                email: user.email,
                                password: user.password,
                                administrador: user.administrador
                            })
                    })
                })
            })
        })
    })
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
        if (user._id) {
            cy.deleteUserById(user._id)
        }
    })
})
