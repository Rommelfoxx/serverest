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

const createInvalidProduct = (overrides = {}) => {
    return {
        _id: '99999999999999',
        nome: 'invalidProduct',
        preco: 2009895555,
        descricao: 'invalidDescription',
        quantidade: 2009895555,

        ...overrides
    }

}

const createInconsistentProduct = (overrides = {}) => {
    return {
        _id: 4444444,
        nome: 999999,
        preco: -111111,
        descricao: 3333333,
        quantidade: -111111,

        ...overrides
    }
}

export default {
    createProduct, createInvalidProduct, createInconsistentProduct
}