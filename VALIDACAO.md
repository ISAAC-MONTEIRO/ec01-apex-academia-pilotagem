# Relatório de validação · EC01 (12/11/2026)

Testes automatizados em Chrome (headless, puppeteer-core) sobre a página real, mais build Docker.

## Requisitos acadêmicos

| # | Requisito | Resultado | Evidência |
|---|---|---|---|
| 1 | Formulário com Nome, Idade, Curso (select, 3 opções) e Nota Final | Passa | Pop-up `#modal-aluno` |
| 1 | Cadastrar adiciona à lista | Passa | 0 → 1 linha após cadastrar |
| 1 | Registros em tabela com Editar e Excluir | Passa | Botões em todas as linhas |
| 1 | Dados em memória (array de objetos) | Passa | `alunos[]`; somem ao recarregar |
| 2 | Classe Aluno (atributos, construtor, isAprovado, toString) | Passa | Edição de 7,5 para 5,0 muda a situação para "Reprovado" |
| 3 | addEventListener + funções anônimas nos cliques | Passa | Formulário, tabela, filtros |
| 3 | Arrow functions na manipulação de dados | Passa | adicionar/buscar/atualizar/remover |
| 3 | Mensagem ao salvar, editar e excluir | Passa | `console.log` + aviso visual nos três casos |
| 4 | Aprovados / média das notas / média das idades | Passa | 4 de 8 · 7,2 · 21,0 anos (conferido à mão) |
| 4 | Nomes em ordem alfabética | Passa | Ordem correta, respeitando acentos |
| 4 | Quantidade por curso | Passa | 2 / 4 / 2 |
| — | Docker | Passa | `docker build` ok; nginx responde 200 em todos os arquivos |
| — | GitHub | Passa | Repositório publicado na conta pessoal |

## Interface e experiência

| Item | Resultado |
|---|---|
| Validação: campos vazios mostram 4 mensagens, foco no primeiro erro | Passa |
| Pop-up fecha por Esc, botão ×, Cancelar e clique fora | Passa |
| Exclusão pede confirmação em pop-up | Passa |
| Estado de carregamento no botão salvar e na carga ilustrativa | Passa |
| Sem rolagem horizontal em 1440, 768 e 390 px | Passa (0 px) |
| Tabela vira cartões no celular | Passa |
| Console sem erros | Passa |
| Nenhum termo de programação na interface | Passa (cursos mapeados, ver README) |
| `prefers-reduced-motion` desliga animações | Implementado (regra CSS + remoção do SMIL) |

## Pendências

- Nenhuma. Fotos do Unsplash ativas, com créditos em `assets/img/README.md`.
