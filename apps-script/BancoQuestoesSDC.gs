
/**
 * SDC | Banco de Questões — MVP 1.6
 * Usa sdcDados_() e sdcRevisor_() já existentes.
 * Não altera as abas atuais.
 */

const SDC_BQ_ABA = 'QUESTOES_SDC';
const SDC_BQ_RESPOSTAS = 'RESPOSTAS_SDC';

const SDC_BQ_CAB = [
  'ID questao', 'Nivel CEFR', 'Habilidade', 'Tema',
  'Texto-base / contexto', 'Enunciado',
  'Alternativa A', 'Alternativa B',
  'Alternativa C', 'Alternativa D',
  'Gabarito', 'Justificativa', 'Dificuldade',
  'Status', 'Autoria', 'Data de cadastro',
  'Ultima atualizacao'
];

const SDC_BQ_CAB_RESPOSTAS = [
  'ID tentativa', 'ID estudante', 'ID questao',
  'Resposta', 'Correta', 'Data e hora', 'Observacao'
];

function configurarBancoQuestoesSDC() {
  sdcRevisor_();

  const ss = sdcDados_();

  const config = [
    [SDC_BQ_ABA, SDC_BQ_CAB],
    [SDC_BQ_RESPOSTAS, SDC_BQ_CAB_RESPOSTAS]
  ];

  const criadas = [];

  config.forEach(([nome, cab]) => {
    let aba = ss.getSheetByName(nome);

    if (!aba) {
      aba = ss.insertSheet(nome);
      aba.getRange(1, 1, 1, cab.length)
        .setValues([cab]);

      aba.setFrozenRows(1);

      aba.getRange(1, 1, 1, cab.length)
        .setFontWeight('bold')
        .setBackground('#e8efff');

      criadas.push(nome);
    } else {
      const atual = aba.getRange(1, 1, 1, cab.length)
        .getDisplayValues()[0];

      if (atual.join('|') !== cab.join('|')) {
        throw new Error(
          'A aba ' + nome +
          ' já existe com cabeçalhos diferentes.'
        );
      }
    }
  });

  const questoes = ss.getSheetByName(SDC_BQ_ABA);

  if (questoes.getMaxRows() < 2) {
    questoes.insertRowsAfter(1, 1);
  }

  const validacoes = [
    [2, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']],
    [3, [
      'Reading', 'Listening', 'Use of English',
      'Writing', 'Speaking'
    ]],
    [11, ['A', 'B', 'C', 'D']],
    [13, ['Facil', 'Media', 'Dificil']],
    [14, ['Em revisao', 'Aprovada', 'Arquivada']]
  ];

  validacoes.forEach(([col, valores]) => {
    const regra = SpreadsheetApp.newDataValidation()
      .requireValueInList(valores, true)
      .setAllowInvalid(false)
      .build();

    questoes.getRange(
      2, col, questoes.getMaxRows() - 1, 1
    ).setDataValidation(regra);
  });

  const resultado = {
    sucesso: true,
    abasCriadas: criadas,
    totalQuestoes: Math.max(
      0, questoes.getLastRow() - 1
    )
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

function cadastrarQuestaoSDC(dados) {
  sdcRevisor_();

  if (!dados || typeof dados !== 'object') {
    throw new Error('Informe os dados da questão.');
  }

  const limpar = v =>
    String(v == null ? '' : v).trim();

  const nivel = limpar(dados.nivel).toUpperCase();
  const habilidade = limpar(dados.habilidade);
  const tema = limpar(dados.tema);
  const enunciado = limpar(dados.enunciado);
  const dificuldade = limpar(dados.dificuldade);
  const gabarito = limpar(dados.gabarito).toUpperCase();

  const alternativas = ['A', 'B', 'C', 'D']
    .map(l => limpar(dados['alternativa' + l]));

  if (!['A1','A2','B1','B2','C1','C2'].includes(nivel)) {
    throw new Error('Nível CEFR inválido.');
  }

  if (![
    'Reading', 'Listening', 'Use of English',
    'Writing', 'Speaking'
  ].includes(habilidade)) {
    throw new Error('Habilidade inválida.');
  }

  if (!tema || !enunciado) {
    throw new Error(
      'Tema e enunciado são obrigatórios.'
    );
  }

  if (!['Facil','Media','Dificil'].includes(dificuldade)) {
    throw new Error('Dificuldade inválida.');
  }

  if (
    !['A','B','C','D'].includes(gabarito) ||
    alternativas.some(a => !a)
  ) {
    throw new Error(
      'Informe quatro alternativas e gabarito A-D.'
    );
  }

  if (!limpar(dados.justificativa)) {
    throw new Error(
      'Informe a justificativa do gabarito.'
    );
  }

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(15000)) {
    throw new Error(
      'Banco ocupado. Tente novamente.'
    );
  }

  try {
    const aba = sdcDados_()
      .getSheetByName(SDC_BQ_ABA);

    if (!aba) {
      throw new Error(
        'Execute configurarBancoQuestoesSDC primeiro.'
      );
    }

    const existentes = aba.getLastRow() > 1
      ? aba.getRange(
          2, 1, aba.getLastRow() - 1, 1
        ).getDisplayValues().flat()
      : [];

    const numeros = existentes
      .map(id => /^SDC-Q(\d+)$/.exec(id))
      .filter(Boolean)
      .map(m => Number(m[1]));

    const proximo = Math.max(0, ...numeros) + 1;

    const id = 'SDC-Q' +
      String(proximo).padStart(4, '0');

    const agora = new Date();

    aba.appendRow([
      id,
      nivel,
      habilidade,
      tema,
      limpar(dados.contexto),
      enunciado,
      ...alternativas,
      gabarito,
      limpar(dados.justificativa),
      dificuldade,
      'Em revisao',
      limpar(dados.autoria),
      agora,
      agora
    ]);

    console.log(
      'Questão criada para revisão: ' + id
    );

    return {
      sucesso: true,
      id: id,
      status: 'Em revisao'
    };

  } finally {
    lock.releaseLock();
  }
}

function listarQuestoesSDC(filtros) {
  sdcRevisor_();

  const aba = sdcDados_()
    .getSheetByName(SDC_BQ_ABA);

  if (!aba) {
    throw new Error(
      'Execute configurarBancoQuestoesSDC primeiro.'
    );
  }

  if (aba.getLastRow() < 2) {
    return [];
  }

  const f = filtros || {};

  return aba.getRange(
    2, 1,
    aba.getLastRow() - 1,
    SDC_BQ_CAB.length
  )
    .getDisplayValues()
    .filter(r => r[0])
    .filter(r => !f.nivel || r[1] === f.nivel)
    .filter(r =>
      !f.habilidade || r[2] === f.habilidade
    )
    .filter(r => !f.status || r[13] === f.status)
    .map(r => ({
      id: r[0],
      nivel: r[1],
      habilidade: r[2],
      tema: r[3],
      enunciado: r[5],
      dificuldade: r[12],
      status: r[13]
    }));
}

function testarBancoQuestoesSDC() {
  const resultado = configurarBancoQuestoesSDC();
  const questoes = listarQuestoesSDC();

  console.log(JSON.stringify({
    configuracao: resultado,
    questoesEncontradas: questoes.length
  }));
}
