/**
 * Exercício 4 — Relatórios com filter, map, reduce, sort e forEach.
 * Funções puras: recebem o array de alunos e devolvem o resultado,
 * sem tocar no DOM. A renderização fica em app.js.
 */
const Relatorios = {
  /** Alunos aprovados (notaFinal >= 7) — filter */
  aprovados: (alunos) => alunos.filter((aluno) => aluno.isAprovado()),

  /** Média das notas finais — map + reduce */
  mediaNotas: (alunos) =>
    alunos.length === 0
      ? 0
      : alunos.map((aluno) => aluno.notaFinal).reduce((soma, nota) => soma + nota, 0) / alunos.length,

  /** Média das idades — reduce */
  mediaIdades: (alunos) =>
    alunos.length === 0 ? 0 : alunos.reduce((soma, aluno) => soma + aluno.idade, 0) / alunos.length,

  /** Nomes em ordem alfabética — map + sort (localeCompare respeita acentos) */
  nomesOrdenados: (alunos) =>
    alunos.map((aluno) => aluno.nome).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })),

  /** Quantidade de alunos por curso — forEach + reduce */
  quantidadePorCurso: (alunos, cursos) => {
    const contagem = {};
    cursos.forEach((curso) => { contagem[curso] = 0; });
    return alunos.reduce((acc, aluno) => {
      acc[aluno.curso] = (acc[aluno.curso] || 0) + 1;
      return acc;
    }, contagem);
  },
};
