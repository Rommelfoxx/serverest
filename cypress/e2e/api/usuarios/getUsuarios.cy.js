
import { createUser, createUserInvalid } from '../../../factories/user.js'

const apiUrl = Cypress.expose('apiUrl')

describe('api usuarios tests GET', () => {
    const user = createUser()
    const userInvalid = createUserInvalid()

    before(() => {

        return cy.criarUsuario(user)
            .then(({ status, body }) => {
                expect(status).to.eq(201)

                user._id = body._id
            })
    })

    context('Successful searches', () => {

        it('Returns all users', () => {
            return cy.request({
                method: 'GET',
                url: `${apiUrl}/usuarios`
            }).then(({ status, body }) => {
                const { usuarios, quantidade } = body

                expect(status).to.eq(200)

                expect(usuarios)
                    .to.be.an('array')
                    .and.not.be.empty

                expect(quantidade)
                    .to.be.a('number')
                    .to.eq(usuarios.length)

                usuarios.forEach((returnedUser) => {
                    expect(returnedUser).to.include.all.keys(
                        'nome',
                        'email',
                        'password',
                        'administrador',
                        '_id'
                    )
                    expect(returnedUser.nome)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(returnedUser.email)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(returnedUser.password)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(returnedUser.administrador)
                        .to.be.a('string')
                        .to.not.be.empty

                    expect(returnedUser._id)
                        .to.be.a('string')
                        .to.not.be.empty
                })
            })
        })

        it('Searches by name and email', () => {

            return cy.request({
                url: `${apiUrl}/usuarios`,
                method: 'GET',
                qs: {
                    'nome': user.nome,
                    'email': user.email
                }
            }).then(({ status, body }) => {
                const { quantidade, usuarios } = body

                expect(usuarios)
                    .to.be.an('array')
                    .and.not.be.empty

                expect(quantidade)
                    .to.be.a('number')
                    .to.eq(usuarios.length)

                expect(status).to.eq(200)

                const returnedResult = usuarios.find(
                    ({ _id }) => _id === user._id
                )

                expect(returnedResult).to.exist

                expect(returnedResult).to.include({
                    nome: user.nome,
                    email: user.email,
                    password: user.password,
                    administrador: user.administrador,
                    _id: user._id
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
            it(`Retrieves a user by ${field}`, () => {
                const expectedValue = value()

                return cy.request({
                    method: 'GET',
                    url: `${apiUrl}/usuarios`,
                    qs: {
                        [field]: expectedValue
                    }
                }).then(({ status, body }) => {
                    const { quantidade, usuarios } = body

                    expect(status).to.eq(200)

                    expect(usuarios)
                        .to.be.an('array')
                        .and.not.be.empty

                    expect(quantidade)
                        .to.be.an('number')
                        .to.eq(usuarios.length)


                    usuarios.forEach((returnedValue) => {
                        expect(returnedValue[field])
                            .to.eq(expectedValue)
                    })

                    const createdUser = usuarios.find(
                        ({ _id }) => _id === user._id
                    )

                    expect(
                        createdUser,
                        'The created user should appear in the results '
                    ).to.exist

                    expect(createdUser)
                        .to.include({
                            nome: user.nome,
                            email: user.email,
                            password: user.password,
                            administrador: user.administrador
                        })

                    if (field === '_id') {
                        expect(quantidade)
                            .to.eq(1)
                    }
                })
            })
        })
    })
    context('Search with nonExistent values', () => {

        const filters = [
            { field: '_id', value: () => userInvalid._id },
            { field: 'nome', value: () => userInvalid.nome },
            { field: 'email', value: () => userInvalid.email },
            { field: 'password', value: () => userInvalid.password },
        ]

        filters.forEach(({ field, value }) => {
            it(`Return no User when search b y ${field}`, () => {
                const expectedValue = value()

                return cy.request({
                    url: `${apiUrl}/usuarios`,
                    method: 'GET',
                    qs: {
                        [field]: expectedValue
                    }
                }).then(({ status, body }) => {
                    const { quantidade, usuarios } = body
                    expect(status).to.eq(200)

                    expect(quantidade).to.eq(0)
                    expect(usuarios)
                        .to.be.an('array')
                        .and.to.be.empty
                })

            })
            //   Scenario: Buscar usuário com ID inexistente
            //     When realizo uma requisição GET para buscar o usuario com o id "idInexistente123"
            //     Then o status da resposta deve ser 200
            //     And a mensagem da resposta deve ser "Usuário não encontrado"

        })


    })
    after(() => {
        if (!user._id) {
            return
        }
        return cy.deleteUserById(user._id)
    })
})
