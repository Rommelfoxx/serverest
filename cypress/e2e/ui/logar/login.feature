Feature: logar na aplicação
  Scenario: Logar na aplicação com usuario não administrador com sucesso
    Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "false" cadastrado
    And esteja na tela de login
    When preenche email "van@gmail.com" e senha "teste123"
    And clica no bottão Entrar
    Then somos direcionados para home
  Scenario: Logar na aplicação com usuario não administrador com sucesso
    Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "true" cadastrado
    And esteja na tela de login
    When preenche email "van@gmail.com" e senha "teste123"
    And clica no bottão Entrar
    Then somos direcionados para home com perfil ADM

  Scenario Outline: Logar na aplicação com usuario incorreto
    Given que possua um usuario "vanderlan" senha "teste123" e email "van@gmail.com" se é administrador "true" cadastrado
    And esteja na tela de login
    When preenche email "<email>" e senha "<senha>"
    And clica no bottão Entrar
    Then é apresentada "<mensagem>" de erro

    Examples:
      | email             | senha    | mensagem                   |
      | van@gmail.com     | teste    | Email e/ou senha inválidos |
      | vanaaaa@gmail.com | teste123 | Email e/ou senha inválidos |
      |                   | teste123 | Email é obrigatório        |
      | vanaaaa@gmail.com |          | Password é obrigatório     |
