const createUser = (overrides = {}) => {
    const timestamp = Date.now()

    return {
        nome: `usuario_teste_${timestamp}`,
        email: `usuario_teste_${timestamp}@gmail.com`,
        password: 'teste123',
        administrador: 'false',
        ...overrides
    }
}

export default {
    createUser
};