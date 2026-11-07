
/**
 * PORTAL SDC 1.7 — MOTOR DE PROVAS
 *
 * Dependências:
 * sdcDados_()
 * sdcRevisor_()
 * QUESTOES_SDC
 *
 * Não altera questões, estudantes ou respostas.
 */

const SDC_MP_ABA = 'HISTORICO_PROVAS_SDC';

function obterQuestoesAprovadasSDC(nivel, habilidades) {
  sdcRevisor_();

  const ss = sdcDados_();
  const aba = ss.getSheetByName('QUESTOES_SDC');

  if (!aba) {
    throw new Error('Banco QUESTOES_SDC não encontrado.');
  }

  if (aba.getLastRow() < 2) return [];

  const dados = aba.getRange(
    2, 1, aba.getLastRow() - 1, 17
  ).getDisplayValues();

  return dados
    .filter(r => r[13] === 'Aprovada')
    .filter(r => r[1] === nivel)
    .filter(r => habilidades.includes(r[2]))
    .filter(r => {
      const campos = [0, 1, 2, 5, 6, 7, 8, 9, 10];
      return campos.every(i => String(r[i]).trim());
    })
    .filter(r => ['A', 'B', 'C', 'D'].includes(r[10]))
    .map(r => ({
      id: r[0],
      nivel: r[1],
      habilidade: r[2],
      tema: r[3],
      contexto: r[4],
      enunciado: r[5],
      alternativas: r.slice(6, 10),
      gabarito: r[10],
      justificativa: r[11]
    }));
}

function embaralharQuestoesSDC(questoes) {
  const lista = [...questoes];

  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }

  return lista;
}

function montarProvaSDC(config) {
  const revisor = sdcRevisor_();

  const nivel = String(config.nivel || '').trim();
  const quantidade = Number(config.quantidade);
  const titulo = String(config.titulo || '').trim();

  const habilidadesPermitidas = [
    'Reading',
    'Listening',
    'Use of English'
  ];

  const habilidades = config.habilidades || [];

  if (!['A1','A2','B1','B2','C1','C2'].includes(nivel)) {
    throw new Error('Nível CEFR inválido.');
  }

  if (!Number.isInteger(quantidade) ||
      quantidade < 1 || quantidade > 30) {
    throw new Error('Quantidade deve estar entre 1 e 30.');
  }

  if (!titulo || titulo.length > 100) {
    throw new Error('Informe um título de até 100 caracteres.');
  }

  if (!Array.isArray(habilidades) ||
      habilidades.length === 0 ||
      habilidades.some(h => !habilidadesPermitidas.includes(h))) {
    throw new Error('Habilidades inválidas.');
  }

  const disponiveis = obterQuestoesAprovadasSDC(
    nivel, habilidades
  );

  if (disponiveis.length < quantidade) {
    throw new Error(
      'QUESTOES_INSUFICIENTES: solicitadas ' +
      quantidade + ', disponíveis ' +
      disponiveis.length +
      '. Aprove pedagogicamente mais questões.'
    );
  }

  const selecionadas = embaralharQuestoesSDC(
    disponiveis
  ).slice(0, quantidade);

  // Documento do estudante: SEM gabarito.
  const prova = DocumentApp.create(
    'SDC | PROVA | ' + titulo + ' | ' + nivel
  );

  const corpo = prova.getBody();

  corpo.appendParagraph('SCHOOL DIPLOMACY CLUBS')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);

  corpo.appendParagraph(titulo)
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  corpo.appendParagraph('Nível de referência: ' + nivel);
  corpo.appendParagraph(
    'Habilidades: ' + habilidades.join(', ')
  );
  corpo.appendParagraph('ID SDC: __________________');
  corpo.appendParagraph('Data: ____/____/________');

  corpo.appendParagraph(
    'Instruções: leia cada questão e marque ' +
    'somente uma alternativa.'
  );

  selecionadas.forEach((q, i) => {
    corpo.appendParagraph(
      'Questão ' + (i + 1) + ' — ' + q.habilidade
    ).setHeading(DocumentApp.ParagraphHeading.HEADING2);

    if (q.contexto) {
      corpo.appendParagraph(q.contexto);
    }

    corpo.appendParagraph(q.enunciado);

    ['A','B','C','D'].forEach((letra, j) => {
      corpo.appendParagraph(
        letra + ') ' + q.alternativas[j]
      );
    });
  });

  prova.saveAndClose();

  // Documento separado: acesso restrito à equipe.
  const gabarito = DocumentApp.create(
    'SDC | GABARITO RESTRITO | ' + titulo + ' | ' + nivel
  );

  const corpoGabarito = gabarito.getBody();

  corpoGabarito.appendParagraph(
    'GABARITO — USO EXCLUSIVO DA EQUIPE PEDAGÓGICA'
  ).setHeading(DocumentApp.ParagraphHeading.TITLE);

  corpoGabarito.appendParagraph(titulo);
  corpoGabarito.appendParagraph('Nível: ' + nivel);

  selecionadas.forEach((q, i) => {
    corpoGabarito.appendParagraph(
      'Questão ' + (i + 1) +
      ' | ID: ' + q.id +
      ' | Resposta: ' + q.gabarito
    );

    corpoGabarito.appendParagraph(
      'Justificativa: ' + q.justificativa
    );
  });

  gabarito.saveAndClose();

  // Histórico de avaliações geradas.
  const ss = sdcDados_();

  let historico = ss.getSheetByName(SDC_MP_ABA);

  if (!historico) {
    historico = ss.insertSheet(SDC_MP_ABA);

    historico.appendRow([
      'Data e hora',
      'Responsavel',
      'Titulo',
      'Nivel CEFR',
      'Habilidades',
      'Quantidade',
      'IDs das questoes',
      'Link da prova',
      'Link do gabarito'
    ]);

    historico.setFrozenRows(1);
  }

  historico.appendRow([
    new Date(),
    revisor,
    titulo,
    nivel,
    habilidades.join(', '),
    quantidade,
    selecionadas.map(q => q.id).join(', '),
    prova.getUrl(),
    gabarito.getUrl()
  ]);

  const resultado = {
    sucesso: true,
    titulo: titulo,
    nivel: nivel,
    quantidade: quantidade,
    questoes: selecionadas.map(q => q.id),
    prova: prova.getUrl(),
    gabarito: gabarito.getUrl()
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

/**
 * TESTE SEGURO
 *
 * Consulta questões disponíveis.
 * NÃO gera prova nem altera a planilha.
 */
function testarMotorProvasSDC() {
  const questoes = obterQuestoesAprovadasSDC(
    'B1',
    ['Reading', 'Use of English']
  );

  const resultado = {
    sucesso: true,
    nivel: 'B1',
    questoesAprovadas: questoes.length,
    quantidadeMinimaParaPiloto: 5,
    podeGerarPiloto: questoes.length >= 5,
    ids: questoes.map(q => q.id)
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

/**
 * GERAR PROVA PILOTO
 *
 * Executar SOMENTE após existirem
 * cinco questões revisadas e aprovadas.
 */
function gerarProvaPilotoSDC() {
  return montarProvaSDC({
    titulo: 'SDC English Diagnostic — Pilot',
    nivel: 'B1',
    quantidade: 5,
    habilidades: [
      'Reading',
      'Use of English'
    ]
  });
}

