/**
 * Apex · Academia de Pilotagem — EC01 Gerenciamento de Alunos
 *
 * Ex. 1  CRUD: formulário (em pop-up), tabela, Editar/Excluir, dados em memória (array de objetos)
 * Ex. 2  Classe Aluno (js/Aluno.js)
 * Ex. 3  addEventListener nos botões do formulário e da tabela, funções anônimas nos cliques,
 *        arrow functions na manipulação dos dados, mensagens (console.log + aviso visual)
 * Ex. 4  Relatórios com filter, map, reduce, sort e forEach (js/relatorios.js)
 */
document.documentElement.classList.add('js');

/* ------------------------------------------------------------------
 * Cursos. O PDF pede as opções JavaScript, Python e Java; na interface
 * elas viram três cursos de pilotagem, mapeados 1:1 (ver README).
 * ------------------------------------------------------------------ */
const CURSOS = {
  'Fórmula Base':            { pneu: 'soft',   composto: 'Macio', original: 'JavaScript' },
  'Telemetria e Engenharia': { pneu: 'medium', composto: 'Médio', original: 'Python' },
  'Estratégia de Corrida':   { pneu: 'hard',   composto: 'Duro',  original: 'Java' },
};
const NOMES_CURSOS = Object.keys(CURSOS);

/* Dados em memória: array de objetos da classe Aluno */
const alunos = [];

let alunoEmEdicao = null;
let alunoParaExcluir = null;
let ultimoAlterado = null;

/* ==================================================================
 * Ex. 3 — Manipulação dos dados com arrow functions
 * ================================================================== */
const adicionarAluno = (dados) => {
  const aluno = new Aluno(dados.nome, dados.idade, dados.curso, dados.notaFinal);
  alunos.push(aluno);
  return aluno;
};

const buscarPorId = (id) => alunos.find((aluno) => aluno.id === id);

const atualizarAluno = (id, dados) => {
  const aluno = buscarPorId(id);
  if (aluno) aluno.atualizar(dados.nome, dados.idade, dados.curso, dados.notaFinal);
  return aluno;
};

const removerAluno = (id) => {
  const indice = alunos.findIndex((aluno) => aluno.id === id);
  return indice >= 0 ? alunos.splice(indice, 1)[0] : null;
};

/* ==================================================================
 * Utilidades
 * ================================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduzMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (n, casas = 1) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const numero2 = (n) => String(n).padStart(2, '0');

/** Cria elementos sem innerHTML (o texto do usuário nunca vira HTML). */
const h = (tag, props = {}, ...filhos) => {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([chave, valor]) => {
    if (valor == null || valor === false) return;
    if (chave === 'class') el.className = valor;
    else if (chave === 'text') el.textContent = valor;
    else el.setAttribute(chave, valor === true ? '' : valor);
  });
  filhos.flat().forEach((filho) => filho != null && el.append(filho));
  return el;
};

/** Anima um número até o valor final (feedback visual dos contadores). */
const animarNumero = (el, destino, casas = 0, sufixo = '') => {
  const inicio = parseFloat(el.dataset.valor || '0');
  el.dataset.valor = destino;
  if (reduzMovimento() || inicio === destino) {
    el.textContent = fmt(destino, casas) + sufixo;
    return;
  }
  const t0 = performance.now();
  const dur = 700;
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(inicio + (destino - inicio) * e, casas) + sufixo;
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
};

/* ==================================================================
 * Avisos (toasts) — feedback de sucesso, erro e informação
 * ================================================================== */
const toasts = $('#toasts');
const avisar = (titulo, texto = '', tipo = 'ok') => {
  const toast = h('div', { class: `toast toast--${tipo}` },
    h('span', { class: 'toast__bar', 'aria-hidden': 'true' }),
    h('div', {}, h('strong', { text: titulo }), texto ? h('p', { text: texto }) : null),
  );
  toasts.append(toast);
  setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 600);
  }, 3400);
};

/* ==================================================================
 * Pop-ups (dialog nativo): abrir, fechar com animação, Esc e clique fora
 * ================================================================== */
const abrirModal = (dialog) => {
  dialog.classList.remove('is-closing');
  dialog.showModal();
  document.body.classList.add('modal-open');
};

const fecharModal = (dialog) => {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  const concluir = () => {
    dialog.classList.remove('is-closing');
    dialog.close();
    if (!$$('dialog[open]').length) document.body.classList.remove('modal-open');
  };
  if (reduzMovimento()) return concluir();
  dialog.classList.add('is-closing');
  setTimeout(concluir, 220);
};

$$('dialog.modal').forEach((dialog) => {
  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    fecharModal(dialog);
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) fecharModal(dialog);
  });
  $$('[data-close]', dialog).forEach((botao) => {
    botao.addEventListener('click', function () {
      fecharModal(dialog);
    });
  });
});

/* ==================================================================
 * Formulário de cadastro / edição
 * ================================================================== */
const modalAluno = $('#modal-aluno');
const form = $('#form-aluno');
const campos = {
  nome: $('#nome'),
  idade: $('#idade'),
  curso: $('#curso'),
  notaFinal: $('#notaFinal'),
};
const btnSalvar = $('#btn-salvar');
const preview = $('#preview-situacao');

const limparErros = () => {
  Object.entries(campos).forEach(([nome, campo]) => {
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
    $(`#${nome}-erro`).textContent = '';
  });
};

const marcarErro = (nome, mensagem) => {
  const campo = campos[nome];
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', `${nome}-erro`);
  $(`#${nome}-erro`).textContent = mensagem;
};

/** Valida e devolve os dados normalizados, ou null se houver erro. */
const validar = () => {
  limparErros();
  const nome = campos.nome.value.trim().replace(/\s+/g, ' ');
  const idadeTexto = campos.idade.value.trim();
  const notaTexto = campos.notaFinal.value.trim().replace(',', '.');
  const idade = Number(idadeTexto);
  const nota = Number(notaTexto);
  const curso = campos.curso.value;
  const erros = [];

  if (nome.length < 3) erros.push(['nome', 'Informe o nome com pelo menos 3 letras.']);
  else if (!/^[\p{L}][\p{L}' .-]*$/u.test(nome)) erros.push(['nome', 'Use apenas letras, espaços, apóstrofo ou hífen.']);

  if (idadeTexto === '') erros.push(['idade', 'Informe a idade.']);
  else if (!Number.isInteger(idade) || idade < 10 || idade > 99) erros.push(['idade', 'A idade deve ser um número inteiro entre 10 e 99.']);

  if (!NOMES_CURSOS.includes(curso)) erros.push(['curso', 'Escolha um dos três cursos.']);

  if (notaTexto === '') erros.push(['notaFinal', 'Informe a nota final.']);
  else if (Number.isNaN(nota) || nota < 0 || nota > 10) erros.push(['notaFinal', 'A nota vai de 0 a 10.']);

  if (erros.length) {
    erros.forEach(([campo, msg]) => marcarErro(campo, msg));
    campos[erros[0][0]].focus();
    const caixa = $('.modal__box', modalAluno);
    caixa.classList.remove('shake');
    void caixa.offsetWidth;
    caixa.classList.add('shake');
    return null;
  }
  return { nome, idade, curso, notaFinal: Math.round(nota * 10) / 10 };
};

const atualizarPreview = () => {
  const texto = campos.notaFinal.value.trim().replace(',', '.');
  const nota = Number(texto);
  if (texto === '' || Number.isNaN(nota) || nota < 0 || nota > 10) {
    preview.textContent = '';
    preview.className = 'modal__hint';
    return;
  }
  const aprovado = nota >= Aluno.NOTA_MINIMA;
  preview.className = `modal__hint ${aprovado ? 'is-ok' : 'is-no'}`;
  preview.textContent = aprovado
    ? `Com nota ${fmt(nota)}, o aluno sai aprovado.`
    : `Com nota ${fmt(nota)}, o aluno fica abaixo da linha de corte (7,0).`;
};
campos.notaFinal.addEventListener('input', atualizarPreview);
Object.entries(campos).forEach(([nome, campo]) => {
  campo.addEventListener('input', function () {
    if (campo.getAttribute('aria-invalid')) {
      campo.removeAttribute('aria-invalid');
      $(`#${nome}-erro`).textContent = '';
    }
  });
});

const abrirFormulario = (aluno = null) => {
  form.reset();
  limparErros();
  alunoEmEdicao = aluno;
  const editando = Boolean(aluno);
  $('#modal-aluno-title').textContent = editando ? `Editar ${aluno.nome}` : 'Novo aluno';
  $('#modal-aluno-kicker').innerHTML = editando ? '<b>Ajuste</b> de dados_' : '<b>Inscrição</b> no grid_';
  $('.btn__label', btnSalvar).textContent = editando ? 'Salvar alterações' : 'Cadastrar';
  if (editando) {
    campos.nome.value = aluno.nome;
    campos.idade.value = aluno.idade;
    campos.curso.value = aluno.curso;
    campos.notaFinal.value = aluno.notaFinal;
  }
  atualizarPreview();
  abrirModal(modalAluno);
  campos.nome.focus();
};

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (btnSalvar.classList.contains('is-loading')) return;
  const dados = validar();
  if (!dados) {
    avisar('Confira os campos', 'Há dados inválidos no formulário.', 'erro');
    return;
  }

  btnSalvar.classList.add('is-loading');
  btnSalvar.disabled = true;

  setTimeout(function () {
    if (alunoEmEdicao) {
      const aluno = atualizarAluno(alunoEmEdicao.id, dados);
      ultimoAlterado = aluno.id;
      console.log('[Apex] Aluno editado:', aluno.toString());
      avisar('Dados atualizados', aluno.toString());
    } else {
      const aluno = adicionarAluno(dados);
      ultimoAlterado = aluno.id;
      console.log('[Apex] Aluno cadastrado:', aluno.toString());
      avisar('Aluno inscrito no grid', aluno.toString());
    }
    btnSalvar.classList.remove('is-loading');
    btnSalvar.disabled = false;
    alunoEmEdicao = null;
    fecharModal(modalAluno);
    atualizarTudo();
    $('#grid').scrollIntoView({ behavior: reduzMovimento() ? 'auto' : 'smooth', block: 'start' });
  }, 450);
});

$$('[data-action="novo-aluno"]').forEach((botao) => {
  botao.addEventListener('click', function () {
    abrirFormulario();
  });
});

/* ==================================================================
 * Exclusão com confirmação
 * ================================================================== */
const modalConfirmar = $('#modal-confirmar');

const pedirExclusao = (aluno) => {
  alunoParaExcluir = aluno;
  $('#confirmar-texto').textContent = `${aluno.nome} (${aluno.curso}, nota ${fmt(aluno.notaFinal)}) sai do grid. Esta ação não pode ser desfeita.`;
  abrirModal(modalConfirmar);
  $('#btn-confirmar-exclusao').focus();
};

$('#btn-confirmar-exclusao').addEventListener('click', function () {
  const aluno = alunoParaExcluir;
  if (!aluno) return;
  fecharModal(modalConfirmar);
  const linha = $(`tr[data-id="${aluno.id}"]`);
  const concluir = () => {
    removerAluno(aluno.id);
    console.log('[Apex] Aluno excluído:', aluno.toString());
    avisar('Aluno removido do grid', aluno.nome, 'info');
    alunoParaExcluir = null;
    atualizarTudo();
  };
  if (linha && !reduzMovimento()) {
    linha.classList.add('is-leaving');
    setTimeout(concluir, 380);
  } else {
    concluir();
  }
});

/* ==================================================================
 * Ex. 1 — Renderização da tabela (grid)
 * ================================================================== */
const tbody = $('#tabela-alunos');
const vazio = $('#empty');

const criarBotao = (rotulo, classe, nomeAluno, icone) =>
  h('button', { type: 'button', class: `row-btn ${classe}`, 'aria-label': `${rotulo} ${nomeAluno}`, title: rotulo },
    h('span', { 'aria-hidden': 'true', text: icone }), h('b', { text: rotulo }));

const renderTabela = () => {
  tbody.replaceChildren();
  vazio.hidden = alunos.length > 0;
  $('#tower').classList.toggle('is-empty', alunos.length === 0);

  alunos.forEach((aluno, indice) => {
    const curso = CURSOS[aluno.curso];
    const aprovado = aluno.isAprovado();

    const btnEditar = criarBotao('Editar', 'row-btn--edit', aluno.nome, '✎');
    const btnExcluir = criarBotao('Excluir', 'row-btn--del', aluno.nome, '×');

    // Ex. 3: addEventListener com funções anônimas nos botões da tabela
    btnEditar.addEventListener('click', function () {
      console.log('[Apex] Editando:', aluno.toString());
      abrirFormulario(buscarPorId(aluno.id));
    });
    btnExcluir.addEventListener('click', function () {
      pedirExclusao(buscarPorId(aluno.id));
    });

    const linha = h('tr', {
      class: `row${aluno.id === ultimoAlterado ? ' is-new' : ''}`,
      'data-id': aluno.id,
      style: `--tyre: var(--${curso.pneu}); --i: ${indice}`,
    },
      h('td', { class: 'row__num', 'data-label': 'Nº' }, h('span', { text: numero2(aluno.id) })),
      h('th', { class: 'row__name', scope: 'row', 'data-label': 'Aluno' }, aluno.nome),
      h('td', { class: 'row__age', 'data-label': 'Idade' }, h('span', { text: `${aluno.idade}` }), h('small', { text: ' anos' })),
      h('td', { class: 'row__course', 'data-label': 'Curso' },
        h('span', { class: 'tyre-dot', 'aria-hidden': 'true' }),
        h('span', { text: aluno.curso })),
      h('td', { class: 'row__grade', 'data-label': 'Nota final' },
        h('span', { class: 'grade' },
          h('b', { text: fmt(aluno.notaFinal) }),
          h('span', { class: 'grade__bar', 'aria-hidden': 'true' },
            h('i', { style: `width: ${aluno.notaFinal * 10}%` })))),
      h('td', { class: 'row__status', 'data-label': 'Situação' },
        h('span', { class: `status ${aprovado ? 'status--ok' : 'status--no'}`, text: aprovado ? 'Aprovado' : 'Reprovado' })),
      h('td', { class: 'row__actions' }, btnEditar, btnExcluir),
    );
    tbody.append(linha);
  });
  ultimoAlterado = null;
};

/* ==================================================================
 * Telemetria (resumo no topo do grid)
 * ================================================================== */
const renderTelemetria = () => {
  const aprovados = Relatorios.aprovados(alunos).length;
  animarNumero($('[data-stat="total"]'), alunos.length);
  animarNumero($('[data-stat="aprovados"]'), aprovados);
  const media = $('[data-stat="media"]');
  if (alunos.length) animarNumero(media, Relatorios.mediaNotas(alunos), 1);
  else { media.textContent = '–'; media.dataset.valor = 0; }
};

/* ==================================================================
 * Ex. 4 — Relatórios
 * ================================================================== */
const rel = (nome) => $(`[data-rel="${nome}"]`);
const vazioRel = (texto) => h('li', { class: 'report__empty', text: texto });

const renderRelatorios = () => {
  // 1. Aprovados (filter), exibidos em ordem de nota
  const aprovados = Relatorios.aprovados(alunos);
  rel('aprovados-count').textContent = `${aprovados.length} de ${alunos.length}`;
  const podio = rel('aprovados');
  podio.replaceChildren();
  if (!aprovados.length) podio.append(vazioRel(alunos.length ? 'Ninguém acima da linha de corte ainda.' : 'Sem alunos no grid.'));
  [...aprovados]
    .sort((a, b) => b.notaFinal - a.notaFinal)
    .forEach((aluno, i) => {
      podio.append(h('li', { class: 'podium__item', style: `--tyre: var(--${CURSOS[aluno.curso].pneu})` },
        h('span', { class: 'podium__pos', text: `P${i + 1}` }),
        h('span', { class: 'podium__name', text: aluno.nome }),
        h('span', { class: 'podium__course' }, h('span', { class: 'tyre-dot', 'aria-hidden': 'true' }), aluno.curso),
        h('b', { class: 'podium__grade', text: fmt(aluno.notaFinal) })));
    });

  // 2. Média das notas (map + reduce)
  const mediaNotas = Relatorios.mediaNotas(alunos);
  rel('media-notas').textContent = alunos.length ? fmt(mediaNotas) : '–';
  rel('media-notas-bar').style.width = `${mediaNotas * 10}%`;

  // 3. Média das idades (reduce)
  const mediaIdades = Relatorios.mediaIdades(alunos);
  rel('media-idades').textContent = alunos.length ? `${fmt(mediaIdades)} anos` : '–';
  const idades = alunos.map((a) => a.idade);
  rel('faixa-idades').textContent = alunos.length
    ? `Do mais novo (${Math.min(...idades)}) ao mais velho (${Math.max(...idades)})`
    : 'Sem alunos no grid';

  // 4. Nomes em ordem alfabética (map + sort)
  const lista = rel('alfabetica');
  lista.replaceChildren();
  const nomes = Relatorios.nomesOrdenados(alunos);
  if (!nomes.length) lista.append(vazioRel('Sem alunos no grid.'));
  nomes.forEach((nome) => lista.append(h('li', { text: nome })));

  // 5. Quantidade por curso (forEach + reduce)
  const porCurso = Relatorios.quantidadePorCurso(alunos, NOMES_CURSOS);
  const barras = rel('cursos');
  barras.replaceChildren();
  Object.entries(porCurso).forEach(([curso, qtd]) => {
    const pct = alunos.length ? (qtd / alunos.length) * 100 : 0;
    barras.append(h('li', { class: 'bars__item', style: `--tyre: var(--${CURSOS[curso].pneu})` },
      h('span', { class: 'bars__label' },
        h('span', { class: 'tyre-dot', 'aria-hidden': 'true' }),
        h('span', { text: curso }),
        h('small', { text: `Composto ${CURSOS[curso].composto.toLowerCase()}` })),
      h('span', { class: 'bars__track', 'aria-hidden': 'true' }, h('i', { style: `width: ${pct}%` })),
      h('b', { class: 'bars__value', text: `${qtd} ${qtd === 1 ? 'aluno' : 'alunos'}` })));
  });
};

/* Botões de relatório: filtram a seção e registram o resultado no console */
$$('.filter').forEach((botao) => {
  botao.addEventListener('click', function () {
    const grupo = botao.dataset.relatorio;
    $$('.filter').forEach((b) => {
      b.classList.toggle('is-active', b === botao);
      b.setAttribute('aria-pressed', String(b === botao));
    });
    $('#reports').dataset.show = grupo;

    const saida = {
      todos: () => alunos.map((a) => a.toString()),
      aprovados: () => Relatorios.aprovados(alunos).map((a) => a.toString()),
      medias: () => ({ mediaNotas: fmt(Relatorios.mediaNotas(alunos)), mediaIdades: fmt(Relatorios.mediaIdades(alunos)) }),
      alfabetica: () => Relatorios.nomesOrdenados(alunos),
      cursos: () => Relatorios.quantidadePorCurso(alunos, NOMES_CURSOS),
    };
    console.log(`[Apex] Relatório "${botao.textContent}":`, saida[grupo]());
  });
});

/* Atualiza tabela, telemetria e relatórios de uma vez */
const atualizarTudo = () => {
  renderTabela();
  renderTelemetria();
  renderRelatorios();
  const demo = $('#btn-demo');
  if (!alunos.length) {
    demo.disabled = false;
    $('span', demo).textContent = 'Carregar dados ilustrativos';
  }
};

/* ==================================================================
 * Dados ilustrativos (fictícios, só para demonstração)
 * ================================================================== */
const DADOS_ILUSTRATIVOS = [
  { nome: 'Lívia Andrade',    idade: 19, curso: 'Fórmula Base',            notaFinal: 8.7 },
  { nome: 'Rafael Tavares',   idade: 22, curso: 'Estratégia de Corrida',   notaFinal: 6.4 },
  { nome: 'Beatriz Moura',    idade: 17, curso: 'Telemetria e Engenharia', notaFinal: 9.3 },
  { nome: 'Caio Fernandes',   idade: 24, curso: 'Fórmula Base',            notaFinal: 7.0 },
  { nome: 'Helena Prado',     idade: 21, curso: 'Telemetria e Engenharia', notaFinal: 5.8 },
  { nome: 'Otávio Reis',      idade: 18, curso: 'Estratégia de Corrida',   notaFinal: 7.9 },
  { nome: 'Marina Coutinho',  idade: 26, curso: 'Fórmula Base',            notaFinal: 9.6 },
  { nome: 'Diego Salles',     idade: 20, curso: 'Telemetria e Engenharia', notaFinal: 6.9 },
];

$('#btn-demo').addEventListener('click', function () {
  const botao = this;
  botao.disabled = true;
  botao.classList.add('is-loading');
  setTimeout(function () {
    DADOS_ILUSTRATIVOS.forEach((dados) => adicionarAluno(dados));
    console.log('[Apex] Dados ilustrativos carregados:', alunos.map((a) => a.toString()));
    botao.classList.remove('is-loading');
    $('span', botao).textContent = 'Dados ilustrativos carregados';
    avisar('Grid carregado', `${DADOS_ILUSTRATIVOS.length} alunos fictícios entraram na pista.`, 'info');
    atualizarTudo();
  }, 500);
});

/* ==================================================================
 * Movimento: luzes de largada, letras cinéticas, revelar ao rolar
 * ================================================================== */
// Letras cinéticas: quebra a palavra em letras e mantém o nome acessível
$$('[data-split]').forEach((el) => {
  const texto = el.textContent.trim();
  el.setAttribute('aria-label', texto);
  el.textContent = '';
  [...texto].forEach((letra, i) => {
    el.append(h('span', { 'aria-hidden': 'true', style: `--i: ${i}`, text: letra }));
  });
});

// Luzes de largada: acendem uma a uma e apagam juntas ("lights out")
(() => {
  const luzes = $('#lights');
  const hero = $('.hero');
  if (!luzes) return;
  if (reduzMovimento()) {
    luzes.classList.add('is-out');
    hero.classList.add('is-go');
    return;
  }
  const colunas = $$('.lights__col', luzes);
  colunas.forEach((col, i) => setTimeout(() => col.classList.add('is-on'), 450 + i * 360));
  setTimeout(() => {
    luzes.classList.add('is-out');
    hero.classList.add('is-go');
  }, 450 + colunas.length * 360 + 650);
})();

// Revelar ao rolar, com cascata em [data-stagger]
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    entrada.target.classList.add('is-in');
    observador.unobserve(entrada.target);
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

$$('.section__head, .toolbar, .tower, .report, .cursos__intro').forEach((el) => {
  el.classList.add('reveal');
  observador.observe(el);
});
$$('[data-stagger]').forEach((grupo) => {
  [...grupo.children].forEach((filho, i) => {
    filho.classList.add('reveal');
    filho.style.setProperty('--i', i);
    observador.observe(filho);
  });
});

// Nav: compacta ao rolar e marca a seção visível
const nav = $('#nav');
const aoRolar = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

const linksNav = $$('.nav__links a');
const observaSecao = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    linksNav.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entrada.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['grid', 'boletim', 'cursos'].forEach((id) => observaSecao.observe($(`#${id}`)));

// Carro SMIL do circuito: para quem pede menos movimento
if (reduzMovimento()) $$('animateMotion').forEach((anim) => anim.remove());

/* ==================================================================
 * Fotos opcionais (js/fotos.js)
 * ================================================================== */
$$('[data-foto]').forEach((slot) => {
  const caminho = typeof FOTOS !== 'undefined' ? FOTOS[slot.dataset.foto] : null;
  if (!caminho) return;
  slot.style.backgroundImage = `url("${caminho}")`;
  slot.classList.add('has-foto');
  slot.parentElement.classList.add('tem-foto');
});

/* Início */
atualizarTudo();
console.log('[Apex] Sistema pronto. Cursos (interface → enunciado):',
  Object.entries(CURSOS).map(([nome, c]) => `${nome} → ${c.original}`));
