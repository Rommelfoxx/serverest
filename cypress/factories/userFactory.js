import { faker } from "@faker-js/faker";

const createUser = (overrides = {}) => {
    return {
        nome: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrador: 'false',
        ...overrides
    }
}

const createUserAdmin = (overrides = {}) => {

    return {
        nome: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrador: 'true',
        ...overrides
    }

}

export default {
    createUser, createUserAdmin
};