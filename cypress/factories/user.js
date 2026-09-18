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

const createUserInvalid = (overrides = {}) => {
    return {
        _id: '6666666666777777',
        nome: 'InvalidUser9999',
        email: 'InvalidEmail@9999.com',
        password: 'invalidPassowrd',
        administrador: 'invalid',
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
    createUser, createUserAdmin, createUserInvalid
};