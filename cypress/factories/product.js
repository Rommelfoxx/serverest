import { faker } from "@faker-js/faker";

const createProduct = (overrides = {}) => {
    return {
        nome: faker.commerce.productName(),
        preco: faker.number.int({ min: 1, max: 1000 }),
        descricao: faker.commerce.productDescription(),
        quantidade: faker.number.int({ min: 1, max: 1000 }),

        ...overrides
    }
}

export default {
    createProduct
}