
import { faker } from "@faker-js/faker";
import { createUser } from '../../../factories/user.js'

const apiUrl = Cypress.expose('apiUrl')
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