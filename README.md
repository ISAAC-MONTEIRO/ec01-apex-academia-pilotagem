# Apex · Academia de Pilotagem (EC01)

Sistema de gerenciamento de alunos com temática de Fórmula 1. Desenvolvido para o
estudo de caso **EC01 – Gerenciamento de Alunos**. A Apex é uma academia fictícia.

HTML, CSS e JavaScript puros, sem frameworks e sem etapa de build.

## Como executar

**Com Docker (desenvolvimento, recarrega ao salvar):**

```bash
docker compose up
# abra http://localhost:8081
```

**Imagem de produção:**

```bash
docker build -t apex-ec01 .
docker run --rm -p 8081:80 apex-ec01
```

**Dev Container (VS Code):** abra a pasta e escolha *Reopen in Container*. O servidor
sobe na porta 8081.

**Sem Docker:** abra o `index.html` direto no navegador. Os scripts não usam módulos,
então a página também funciona via `file://`.

## Estrutura

```
EC_01/
├── index.html            páginas, formulário (pop-up) e tabela
├── css/style.css         identidade visual, responsividade e animações
├── js/
│   ├── Aluno.js          Ex. 2: classe Aluno
│   ├── relatorios.js     Ex. 4: filter, map, reduce, sort, forEach
│   ├── app.js            Ex. 1 e 3: CRUD, eventos, pop-ups, renderização
│   └── fotos.js          slots opcionais de fotografia
├── assets/img/           fotos (opcionais), ver README da pasta
├── Dockerfile · nginx.conf · docker-compose.yml · .devcontainer/
```

## Requisitos do enunciado e onde estão

| Exercício | Requisito | Implementação |
|---|---|---|
| 1 | Formulário com Nome (text), Idade (number), Curso (select), Nota Final (number) | `index.html`, `#modal-aluno` (pop-up) |
| 1 | "Cadastrar" adiciona à lista | `form.addEventListener('submit', …)` em `app.js` |
| 1 | Registros em tabela, com Editar e Excluir por linha | `renderTabela()` em `app.js` |
| 1 | Dados em memória (array de objetos) | `const alunos = []` em `app.js` |
| 2 | Classe `Aluno` com nome, idade, curso, notaFinal e construtor | `js/Aluno.js` |
| 2 | `isAprovado()` (nota ≥ 7) e `toString()` | `js/Aluno.js` |
| 3 | `addEventListener` nos botões do formulário e da tabela | `app.js` (submit, novo, editar, excluir, filtros) |
| 3 | Funções anônimas nos cliques | `addEventListener('click', function () { … })` |
| 3 | Arrow functions na manipulação de dados | `adicionarAluno`, `buscarPorId`, `atualizarAluno`, `removerAluno` |
| 3 | Mensagens ao salvar, editar e excluir | `console.log` + aviso visual (toast) |
| 4 | Alunos aprovados | `Relatorios.aprovados` (filter) |
| 4 | Média das notas finais | `Relatorios.mediaNotas` (map + reduce) |
| 4 | Média das idades | `Relatorios.mediaIdades` (reduce) |
| 4 | Nomes em ordem alfabética | `Relatorios.nomesOrdenados` (map + sort) |
| 4 | Quantidade por curso | `Relatorios.quantidadePorCurso` (forEach + reduce) |
| — | Versionado no GitHub e container Docker | repositório Git, `Dockerfile`, `docker-compose.yml`, `.devcontainer/` |

### Cursos: mapeamento para o enunciado

O enunciado pede as opções JavaScript, Python e Java. Para manter a temática de
automobilismo, cada opção virou um curso de pilotagem, com correspondência 1:1. O
mapeamento está na constante `CURSOS` em `js/app.js` e aparece no console ao abrir a página.

| Na interface | No enunciado | Composto de pneu (cor) |
|---|---|---|
| Fórmula Base | JavaScript | Macio (vermelho) |
| Telemetria e Engenharia | Python | Médio (amarelo) |
| Estratégia de Corrida | Java | Duro (branco) |

## Validações do formulário

- Nome: obrigatório, mínimo de 3 letras, só letras, espaço, apóstrofo ou hífen.
- Idade: inteiro entre 10 e 99.
- Curso: uma das três opções.
- Nota final: de 0 a 10 (aceita vírgula ou ponto), arredondada a uma casa.

## Dados ilustrativos

O botão **Carregar dados ilustrativos** insere 8 alunos fictícios para demonstração.
Nomes e notas são inventados e não representam pessoas reais.

## Manutenção

- **Cores e tipografia:** tokens no topo de `css/style.css` (`--accent`, `--soft`, `--medium`, `--hard`…).
- **Novo curso:** acrescente a opção no `<select>` e uma entrada em `CURSOS` (`app.js`).
- **Nota de corte:** `Aluno.NOTA_MINIMA` em `js/Aluno.js`.
- **Fotos:** veja `assets/img/README.md`.

## Acessibilidade e movimento

Pop-ups com `<dialog>` nativo (Esc, foco, clique fora), mensagens de erro ligadas aos campos
por `aria-describedby`, avisos em região `aria-live`, foco visível e tabela que vira cartões
no celular. Com `prefers-reduced-motion`, as animações são desligadas e a página fica completa.

## Créditos visuais

Fotografias do Unsplash (Licença Unsplash); autores e links em `assets/img/README.md`.
Ilustrações (carro, luzes de largada, circuito, bandeira) desenhadas em SVG para este projeto.
Fontes Titillium Web e Barlow Condensed (Google Fonts, licença OFL). Nenhum logotipo da FIA, da Fórmula 1 ou de equipes faz parte da identidade visual;
as fotos de pista podem mostrar carros e patrocinadores reais, apenas como ambientação.
