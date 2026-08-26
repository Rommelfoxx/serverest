import { faker } from "@faker-js/faker";

const createUser = (overrides = {}) => {
    return {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...overrides
    }
}
export default {
    createUser
};