

/**
 * PORTAL SDC — GERADOR DE PLANOS DE AULA
 * MVP 1.5
 *
 * Usa modelos pedagógicos estruturados.
 * Não depende de API externa ou IA paga.
 */

function gerarPlanoDeAulaSDC() {

  // ALTERE APENAS ESTES CAMPOS PARA CADA PLANO
  const config = {
    tema: 'Cultural Identity and Diplomacy',
    nivel: 'B1',
    duracao: 60,
    publico: 'Estudantes de 14 a 18 anos',
    objetivo: 'Expressar opiniões, comparar culturas e participar de diálogos interculturais.',
    professor: 'Equipe SDC'
  };

  // Reutiliza a autorização do projeto.
  sdcRevisor_();

  const niveis = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  if (!niveis.includes(config.nivel)) {
    throw new Error('Nível CEFR inválido.');
  }

  if (!config.tema.trim() || !config.objetivo.trim()) {
    throw new Error('Tema e objetivo são obrigatórios.');
  }

  if (!Number.isInteger(config.duracao) ||
      config.duracao < 30 ||
      config.duracao > 180) {
    throw new Error('A duração deve estar entre 30 e 180 minutos.');
  }

  const perfis = {
    A1: {
      habilidade: 'Compreender e produzir frases simples.',
      atividade: 'Apresentar-se e identificar informações pessoais.',
      avaliacao: 'Responder perguntas simples com apoio visual.'
    },
    A2: {
      habilidade: 'Participar de interações curtas sobre temas familiares.',
      atividade: 'Comparar hábitos culturais usando frases guiadas.',
      avaliacao: 'Produzir pequenos diálogos com apoio.'
    },
    B1: {
      habilidade: 'Expressar opiniões e justificar ideias em situações familiares.',
      atividade: 'Participar de discussões em grupos sobre situações interculturais.',
      avaliacao: 'Apresentar argumentos compreensíveis e exemplos.'
    },
    B2: {
      habilidade: 'Defender pontos de vista com argumentos desenvolvidos.',
      atividade: 'Simular uma negociação diplomática em grupos.',
      avaliacao: 'Sustentar argumentos e responder a contrapontos.'
    },
    C1: {
      habilidade: 'Comunicar ideias complexas com clareza e flexibilidade.',
      atividade: 'Analisar cenários diplomáticos e propor soluções.',
      avaliacao: 'Apresentar propostas fundamentadas e bem organizadas.'
    },
    C2: {
      habilidade: 'Expressar nuances e negociar significados com precisão.',
      atividade: 'Conduzir debates complexos e produzir sínteses críticas.',
      avaliacao: 'Avaliar criticamente argumentos e formular conclusões.'
    }
  };

  const perfil = perfis[config.nivel];

  // Distribuição proporcional do tempo.
  const tempos = [
    Math.round(config.duracao * 0.15),
    Math.round(config.duracao * 0.20),
    Math.round(config.duracao * 0.35),
    Math.round(config.duracao * 0.20)
  ];

  tempos.push(
    config.duracao - tempos.reduce((a, b) => a + b, 0)
  );

  const etapas = [
    [
      'Warm-up',
      tempos[0],
      'Ativar conhecimentos prévios com uma pergunta relacionada ao tema.'
    ],
    [
      'Input e contextualização',
      tempos[1],
      'Apresentar um texto curto, imagem ou situação autêntica sobre o tema.'
    ],
    [
      'Prática colaborativa',
      tempos[2],
      perfil.atividade
    ],
    [
      'Produção e compartilhamento',
      tempos[3],
      'Socializar ideias, apresentar conclusões e receber feedback.'
    ],
    [
      'Avaliação e fechamento',
      tempos[4],
      perfil.avaliacao
    ]
  ];

  const hoje = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'dd/MM/yyyy'
  );

  const doc = DocumentApp.create(
    'SDC | Plano de Aula | ' +
    config.nivel + ' | ' + config.tema
  );

  const body = doc.getBody();

  body.appendParagraph('SCHOOL DIPLOMACY CLUBS')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph('PLANO DE AULA')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph('Data de geração: ' + hoje);
  body.appendParagraph('Professor(a): ' + config.professor);
  body.appendParagraph('Tema: ' + config.tema);
  body.appendParagraph('Público: ' + config.publico);
  body.appendParagraph('Nível de referência: CEFR ' + config.nivel);
  body.appendParagraph('Duração: ' + config.duracao + ' minutos');

  body.appendParagraph('1. Objetivo de aprendizagem')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(config.objetivo);

  body.appendParagraph('2. Habilidade linguística de referência')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(perfil.habilidade);

  body.appendParagraph('3. Metodologia')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'Aprendizagem ativa, interação colaborativa, ' +
    'mediação docente e comunicação intercultural. ' +
    'As atividades devem ser ajustadas ao repertório da turma.'
  );

  body.appendParagraph('4. Sequência didática')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const tabela = [
    ['Etapa', 'Tempo', 'Atividade'],
    ...etapas.map(e => [
      e[0],
      e[1] + ' min',
      e[2]
    ])
  ];

  body.appendTable(tabela);

  body.appendParagraph('5. Recursos didáticos')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'Computador ou celular, projetor quando disponível, ' +
    'material visual, textos de apoio e plataforma de videoconferência.'
  );

  body.appendParagraph('6. Avaliação formativa')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(perfil.avaliacao);

  body.appendParagraph(
    'Critérios sugeridos: participação, clareza da comunicação, ' +
    'adequação ao objetivo e colaboração.'
  );

  body.appendParagraph('7. Adaptações e acessibilidade')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'Oferecer instruções claras, exemplos, apoio visual, ' +
    'tempo de preparação e alternativas de participação ' +
    'oral ou escrita conforme as necessidades dos estudantes.'
  );

  body.appendParagraph('8. Reflexão pós-aula')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'O que funcionou? Quais dificuldades surgiram? ' +
    'Que ajustes serão necessários no próximo encontro?'
  );

  doc.saveAndClose();

  // Histórico dos planos gerados.
  const ss = sdcDados_();
  const nomeAba = 'HISTORICO_PLANOS_AULA';

  let aba = ss.getSheetByName(nomeAba);

  if (!aba) {
    aba = ss.insertSheet(nomeAba);
    aba.appendRow([
      'Data', 'Tema', 'Nível CEFR',
      'Duração (min)', 'Professor',
      'Público', 'Link do plano'
    ]);
  }

  aba.appendRow([
    hoje,
    config.tema,
    config.nivel,
    config.duracao,
    config.professor,
    config.publico,
    doc.getUrl()
  ]);

  const resultado = {
    sucesso: true,
    tema: config.tema,
    nivel: config.nivel,
    duracao: config.duracao,
    url: doc.getUrl()
  };

  console.log(JSON.stringify(resultado));

  return resultado;
}
