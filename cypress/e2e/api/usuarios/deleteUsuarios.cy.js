import { createUser } from '../../../factories/user.js'

const apiUrl = Cypress.expose('apiUrl')

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