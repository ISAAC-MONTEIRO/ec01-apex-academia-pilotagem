/**
 * Exercício 2 — Classe Aluno
 * Atributos: nome, idade, curso, notaFinal
 * Construtor para inicializar os dados
 * isAprovado(): true se notaFinal >= 7
 * toString(): dados do aluno formatados
 */
class Aluno {
  static NOTA_MINIMA = 7;
  static #proximoId = 1;

  constructor(nome, idade, curso, notaFinal) {
    this.id = Aluno.#proximoId++;
    this.nome = nome;
    this.idade = idade;
    this.curso = curso;
    this.notaFinal = notaFinal;
  }

  isAprovado() {
    return this.notaFinal >= Aluno.NOTA_MINIMA;
  }

  /** Atualiza os atributos do aluno (usado na edição). */
  atualizar(nome, idade, curso, notaFinal) {
    this.nome = nome;
    this.idade = idade;
    this.curso = curso;
    this.notaFinal = notaFinal;
  }

  toString() {
    const situacao = this.isAprovado() ? 'Aprovado' : 'Reprovado';
    return `#${String(this.id).padStart(2, '0')} ${this.nome} | ${this.idade} anos | ${this.curso} | Nota ${this.notaFinal.toFixed(1).replace('.', ',')} | ${situacao}`;
  }
}
