import { faker } from "@faker-js/faker";

const createUser = (overrides = {}) => {
    return {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrator: 'false',
        ...overrides
    }
}

const creatUserAdmin = (overrides = {}) => {

    return {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrator: 'true',
        ...overrides
    }

}

export default {
    createUser, creatUserAdmin
};