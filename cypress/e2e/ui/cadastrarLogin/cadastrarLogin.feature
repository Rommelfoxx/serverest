Feature: Criar login para a aplicação
  Scenario: Cadastro de novo usuario com sucesso
    Given que o usuario "vanderlan" nao tenha sido criado anteriormente
    And esteja na tela de cadastro
    When preenche usuario "vanderlan" email "vanderlan@ig.com" e senha "teste2"
    And clica no bottão Cadastrar
    Then usuario "vanderlan" é criado com sucesso 
    And somos direcionados para home 

  Scenario Outline: Cadastro de novo usuario com falha
    Given esteja na tela de cadastro
    When preenche usuario "<usuario>" email "<email>" e senha "<senha>"
    And  clica no bottão Cadastrar
    Then é apresentada "<mensagem>" de erro

    Examples:
      | usuario | email      | senha | mensagem                       |
      | teste1  | test44@van | senha | Email deve ser um email válido |
      |         | test44@van | senha | Nome é obrigatório             |
      | teste1  | test44@van |       | Password é obrigatório         |
      | teste1  |            | senha | Email é obrigatório            |
