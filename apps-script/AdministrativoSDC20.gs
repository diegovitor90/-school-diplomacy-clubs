/**
 * PORTAL SDC 2.0 — MVP ADMINISTRATIVO
 *
 * Depende de:
 * sdcDados_()
 * sdcRevisor_()
 *
 * Preserva as funcionalidades existentes.
 */

const SDC20_EMAILS_ADMIN = sdcRevisoresConfig_();

const SDC20_REL = 'HISTORICO_RELATORIOS';
const SDC20_PLAN = 'HISTORICO_PLANOS_AULA';
const SDC20_AUD = 'AUDITORIA_GERADORES_SDC';

function sdc20Autorizar_() {
  const email = String(
    Session.getActiveUser().getEmail() || ''
  ).trim().toLowerCase();

  if (
    !email ||
    !SDC20_EMAILS_ADMIN.includes(email)
  ) {
    throw new Error(
      'Acesso administrativo negado: ' +
      'conta não autorizada ou não identificada.'
    );
  }

  sdcRevisor_();
  return email;
}

function testarAcessoAdministrativoSDC() {
  const email = sdc20Autorizar_();

  const resultado = {
    autorizado: true,
    email: email
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

function sdc20Campo_(valor, nome, max, obrigatorio) {
  const texto = String(
    valor == null ? '' : valor
  ).trim();

  if (
    (obrigatorio && !texto) ||
    texto.length > max
  ) {
    throw new Error(
      'Campo inválido: ' + nome
    );
  }

  return texto;
}

function sdc20AbaHistorico_(ss, nome, colunas) {
  let aba = ss.getSheetByName(nome);

  if (!aba) {
    aba = ss.insertSheet(nome);

    aba.getRange(1, 1, 1, colunas.length)
      .setValues([colunas]);

    aba.setFrozenRows(1);

    aba.getRange(1, 1, 1, colunas.length)
      .setBackground('#e8efff')
      .setFontWeight('bold');

  } else {
    const atual = aba.getRange(
      1, 1, 1, colunas.length
    ).getDisplayValues()[0];

    if (atual.join('|') !== colunas.join('|')) {
      throw new Error(
        'Cabeçalhos incompatíveis: ' + nome
      );
    }
  }

  return aba;
}

function sdc20Auditar_(ss, email, acao, url, descricao) {
  const aba = sdc20AbaHistorico_(
    ss,
    SDC20_AUD,
    [
      'Data/hora',
      'Revisor',
      'Acao',
      'Documento',
      'Descricao'
    ]
  );

  aba.appendRow([
    new Date(),
    email,
    acao,
    url,
    descricao
  ]);
}

function sdc20Historico_(ss, nome, maximo) {
  const aba = ss.getSheetByName(nome);

  if (!aba || aba.getLastRow() < 2) {
    return [];
  }

  const total = Math.min(
    maximo,
    aba.getLastRow() - 1
  );

  const inicio = aba.getLastRow() - total + 1;
  const colunas = nome === SDC20_REL ? 10 : 7;

  return aba.getRange(
    inicio, 1, total, colunas
  ).getDisplayValues()
    .reverse()
    .filter(r => r[0])
    .map(r => ({
      data: nome === SDC20_REL ? r[1] : r[0],
      titulo: nome === SDC20_REL
        ? 'Relatório — ' + r[0]
        : r[1] + ' · ' + r[2],
      link: r[colunas - 1]
    }));
}

function obterAdministrativoSDC() {
  const email = sdc20Autorizar_();
  const ss = sdcDados_();

  return {
    email: email,

    competencia: Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM'
    ),

    relatorios: sdc20Historico_(
      ss, SDC20_REL, 12
    ),

    planos: sdc20Historico_(
      ss, SDC20_PLAN, 12
    )
  };
}

function sdc20Estatisticas_(ss) {
  const a = ss.getSheetByName('ALUNOS_BASE');
  const e = ss.getSheetByName('ESCOLAS');
  const d = ss.getSheetByName('REGISTRO_DOCUMENTOS');

  if (!a || !e || !d) {
    throw new Error(
      'Abas de dados não encontradas.'
    );
  }

  const base = a.getDataRange()
    .getDisplayValues()
    .slice(1)
    .filter(r => String(r[0]).trim());

  const confirmados = base.filter(r =>
    String(r[3]).trim().toUpperCase() === 'SIM'
  );

  const ids = new Set(
    confirmados.map(r => String(r[0]).trim())
  );

  const documentos = d.getDataRange()
    .getDisplayValues()
    .slice(1)
    .filter(r => ids.has(String(r[0]).trim()));

  const contar = situacao => new Set(
    documentos.filter(r =>
      String(r[1]).trim() === situacao
    ).map(r => String(r[0]).trim())
  ).size;

  const registrados = new Set(
    documentos.map(r => String(r[0]).trim())
  ).size;

  const niveis = {
    A1: 0, A2: 0, B1: 0,
    B2: 0, C1: 0, C2: 0
  };

  confirmados.forEach(r => {
    const nivel = String(r[4])
      .trim().toUpperCase();

    if (
      Object.prototype.hasOwnProperty.call(
        niveis, nivel
      )
    ) {
      niveis[nivel]++;
    }
  });

  return {
    escolas: e.getDataRange()
      .getDisplayValues()
      .slice(1)
      .filter(r =>
        r.some(v => String(v).trim())
      ).length,

    estudantes: base.length,
    confirmados: confirmados.length,

    recebidos: contar(
      'Recebido — aguardando conferência'
    ),

    validados: contar('Validado'),

    correcao: contar('Correção necessária'),

    pendentes: Math.max(
      0,
      confirmados.length - registrados
    ),

    niveis: niveis
  };
}

/**
 * GERADOR DE RELATÓRIO
 */

function gerarRelatorioGestaoSDC(entrada) {
  const email = sdc20Autorizar_();

  if (
    !entrada ||
    typeof entrada !== 'object' ||
    Array.isArray(entrada)
  ) {
    throw new Error('Formulário inválido.');
  }

  const atividades = sdc20Campo_(
    entrada.atividades,
    'Atividades', 3000, false
  );

  const dificuldades = sdc20Campo_(
    entrada.dificuldades,
    'Dificuldades', 3000, false
  );

  const encaminhamentos = sdc20Campo_(
    entrada.encaminhamentos,
    'Encaminhamentos', 3000, false
  );

  const ss = sdcDados_();
  const k = sdc20Estatisticas_(ss);

  const agora = new Date();
  const tz = Session.getScriptTimeZone();

  const competencia = Utilities.formatDate(
    agora, tz, 'yyyy-MM'
  );

  const extracao = Utilities.formatDate(
    agora, tz, 'dd/MM/yyyy HH:mm'
  );

  const doc = DocumentApp.create(
    'SDC | Relatório de situação | ' +
    competencia
  );

  const body = doc.getBody();

  body.appendParagraph('SCHOOL DIPLOMACY CLUBS')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph(
    'Relatório administrativo — ' + competencia
  ).setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph(
    'Data de extração: ' + extracao
  );

  body.appendParagraph(
    'Responsável: ' + email
  );

  body.appendParagraph(
    'Os indicadores representam a situação ' +
    'da base na data da extração, não ' +
    'necessariamente toda a movimentação mensal.'
  );

  body.appendParagraph('1. Indicadores')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendTable([
    ['Indicador', 'Quantidade'],
    ['Escolas', String(k.escolas)],
    ['Estudantes', String(k.estudantes)],
    ['Confirmados', String(k.confirmados)],
    ['Aguardando conferência', String(k.recebidos)],
    ['Validados', String(k.validados)],
    ['Em correção', String(k.correcao)],
    ['Sem registro documental', String(k.pendentes)]
  ]);

  body.appendParagraph('2. Distribuição CEFR')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendTable([
    ['Nível', 'Estudantes confirmados'],
    ...Object.keys(k.niveis).map(n => [
      n, String(k.niveis[n])
    ])
  ]);

  [
    ['3. Atividades realizadas', atividades],
    ['4. Dificuldades', dificuldades],
    ['5. Encaminhamentos', encaminhamentos]
  ].forEach(item => {

    body.appendParagraph(item[0])
      .setHeading(
        DocumentApp.ParagraphHeading.HEADING2
      );

    body.appendParagraph(
      item[1] ||
      'Não informado pela coordenação.'
    );
  });

  doc.saveAndClose();

  const historico = sdc20AbaHistorico_(
    ss,
    SDC20_REL,
    [
      'Competência',
      'Data da extração',
      'Escolas',
      'Estudantes',
      'Confirmados',
      'Aguardando conferência',
      'Validados',
      'Correção',
      'Pendentes',
      'Link do relatório'
    ]
  );

  historico.appendRow([
    competencia,
    extracao,
    k.escolas,
    k.estudantes,
    k.confirmados,
    k.recebidos,
    k.validados,
    k.correcao,
    k.pendentes,
    doc.getUrl()
  ]);

  sdc20Auditar_(
    ss,
    email,
    'GERAR_RELATORIO',
    doc.getUrl(),
    competencia
  );

  return {
    sucesso: true,
    url: doc.getUrl(),
    competencia: competencia
  };
}

/**
 * GERADOR DE PLANOS DE AULA
 */

function gerarPlanoGestaoSDC(entrada) {
  const email = sdc20Autorizar_();

  if (
    !entrada ||
    typeof entrada !== 'object' ||
    Array.isArray(entrada)
  ) {
    throw new Error('Formulário inválido.');
  }

  const tema = sdc20Campo_(
    entrada.tema, 'Tema', 120, true
  );

  const nivel = sdc20Campo_(
    entrada.nivel, 'Nível', 2, true
  ).toUpperCase();

  const objetivo = sdc20Campo_(
    entrada.objetivo, 'Objetivo', 1500, true
  );

  const professor = sdc20Campo_(
    entrada.professor || 'Equipe SDC',
    'Professor', 120, true
  );

  const publico = sdc20Campo_(
    entrada.publico || 'Estudantes do SDC',
    'Público', 150, true
  );

  const duracao = Number(entrada.duracao);

  if (
    !['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      .includes(nivel)
  ) {
    throw new Error('CEFR inválido.');
  }

  if (
    !Number.isInteger(duracao) ||
    duracao < 30 ||
    duracao > 180
  ) {
    throw new Error(
      'Duração deve estar entre 30 e 180 minutos.'
    );
  }

  const atividades = {
    A1: 'Apresentações guiadas e vocabulário visual.',
    A2: 'Diálogos curtos e comparação cultural.',
    B1: 'Discussão colaborativa e apresentação de opiniões.',
    B2: 'Debate, argumentos e contrapontos.',
    C1: 'Análise de cenário diplomático e propostas.',
    C2: 'Discussão crítica e negociação complexa.'
  };

  const tempos = [
    Math.round(duracao * 0.15),
    Math.round(duracao * 0.20),
    Math.round(duracao * 0.35),
    Math.round(duracao * 0.20)
  ];

  tempos.push(
    duracao - tempos.reduce(
      (a, b) => a + b, 0
    )
  );

  const data = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'dd/MM/yyyy'
  );

  const doc = DocumentApp.create(
    'SDC | Plano de aula | ' +
    nivel + ' | ' + tema
  );

  const body = doc.getBody();

  body.appendParagraph('SCHOOL DIPLOMACY CLUBS')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph(
    'Plano de aula — ' + tema
  ).setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph(
    'Data: ' + data +
    ' | CEFR: ' + nivel
  );

  body.appendParagraph(
    'Professor: ' + professor +
    ' | Público: ' + publico
  );

  body.appendParagraph(
    'Duração: ' + duracao + ' minutos'
  );

  body.appendParagraph('Objetivo de aprendizagem')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(objetivo);

  body.appendParagraph('Sequência didática')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendTable([
    ['Etapa', 'Tempo', 'Atividade'],

    [
      'Warm-up',
      tempos[0] + ' min',
      'Ativar conhecimentos prévios sobre ' + tema
    ],

    [
      'Input',
      tempos[1] + ' min',
      'Apresentar material multimodal e vocabulário'
    ],

    [
      'Interação',
      tempos[2] + ' min',
      atividades[nivel]
    ],

    [
      'Produção',
      tempos[3] + ' min',
      'Compartilhar conclusões e receber feedback'
    ],

    [
      'Avaliação',
      tempos[4] + ' min',
      'Verificar evidências de aprendizagem'
    ]
  ]);

  body.appendParagraph('Avaliação formativa')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'Observar participação, clareza, colaboração ' +
    'e adequação linguística aos objetivos.'
  );

  body.appendParagraph('Acessibilidade')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'Oferecer instruções por etapas, apoio visual ' +
    'e alternativas de participação.'
  );

  body.appendParagraph('Reflexão pós-aula')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'O que funcionou? O que precisa ser ajustado?'
  );

  body.appendParagraph(
    'Plano pedagógico sugerido, sujeito à revisão docente.'
  );

  doc.saveAndClose();

  const ss = sdcDados_();

  const historico = sdc20AbaHistorico_(
    ss,
    SDC20_PLAN,
    [
      'Data',
      'Tema',
      'Nível CEFR',
      'Duração (min)',
      'Professor',
      'Público',
      'Link do plano'
    ]
  );

  const literal = t =>
    /^[=+\-@]/.test(t) ? "'" + t : t;

  historico.appendRow([
    data,
    literal(tema),
    nivel,
    duracao,
    literal(professor),
    literal(publico),
    doc.getUrl()
  ]);

  sdc20Auditar_(
    ss,
    email,
    'GERAR_PLANO',
    doc.getUrl(),
    nivel + ' — ' + tema
  );

  return {
    sucesso: true,
    url: doc.getUrl(),
    tema: tema,
    nivel: nivel
  };
}
