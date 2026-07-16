Feature: API de Usuários

  Scenario: Listar usuários com sucesso
    When realizo uma requisição GET para listar os usuarios
    Then o status da resposta deve ser 200
    And a resposta deve conter a lista de usuarios

  Scenario: Cadastrar usuário com sucesso
    Given que eu tenha os dados de um novo usuario
    When realizo uma requisição POST para cadastrar o usuario
    Then o status da resposta deve ser 201
    And a mensagem da resposta deve ser "Cadastro realizado com sucesso"

  Scenario: Não deve cadastrar usuário com email já utilizado
    Given que exista um usuario cadastrado
    When realizo uma requisição POST para cadastrar outro usuario com o mesmo email
    Then o status da resposta deve ser 400
    And a mensagem da resposta deve ser "Este email já está sendo usado"

  Scenario Outline: Não deve cadastrar usuário com campo obrigatório ausente
    When realizo uma requisição POST para cadastrar um usuario sem o campo "<campo>"
    Then o status da resposta deve ser 400
    And a resposta deve conter o campo "<campo>" com a mensagem "<mensagem>"

    Examples:
      | campo         | mensagem                    |
      | nome          | nome é obrigatório          |
      | email         | email é obrigatório         |
      | password      | password é obrigatório      |
      | administrador | administrador é obrigatório |

  Scenario: Buscar usuário por ID com sucesso
    Given que exista um usuario cadastrado
    When realizo uma requisição GET para buscar o usuario pelo id
    Then o status da resposta deve ser 200
    And o usuario retornado deve ter o mesmo email do usuario cadastrado

  Scenario: Buscar usuário com ID inexistente
    When realizo uma requisição GET para buscar o usuario com o id "idInexistente123"
    Then o status da resposta deve ser 400
    And a mensagem da resposta deve ser "Usuário não encontrado"

  Scenario: Editar usuário com sucesso
    Given que exista um usuario cadastrado
    When realizo uma requisição PUT alterando o nome do usuario para "Usuario Editado"
    Then o status da resposta deve ser 200
    And a mensagem da resposta deve ser "Registro alterado com sucesso"

  Scenario: Deletar usuário com sucesso
    Given que exista um usuario cadastrado
    When realizo uma requisição DELETE para excluir o usuario cadastrado
    Then o status da resposta deve ser 200
    And a mensagem da resposta deve ser "Registro excluído com sucesso"

  Scenario: Deletar usuário com ID inexistente
    When realizo uma requisição DELETE para excluir o usuario com o id "idInexistente123"
    Then o status da resposta deve ser 200
    And a mensagem da resposta deve ser "Nenhum registro excluído"
