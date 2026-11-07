
const SDC_RELATORIOS_ABA = 'HISTORICO_RELATORIOS';

function gerarRelatorioMensalSDC() {
  sdcRevisor_(); // Reutiliza o controle de acesso do portal.

  const ss = sdcDados_();
  const alunos = ss.getSheetByName('ALUNOS_BASE');
  const escolas = ss.getSheetByName('ESCOLAS');
  const registros = ss.getSheetByName('REGISTRO_DOCUMENTOS');

  if (!alunos || !escolas || !registros) {
    throw new Error('Uma das abas necessárias não foi encontrada.');
  }

  const hoje = new Date();
  const dataExtracao = Utilities.formatDate(
    hoje, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'
  );
  const competencia = Utilities.formatDate(
    hoje, Session.getScriptTimeZone(), 'yyyy-MM'
  );

  const base = alunos.getDataRange().getDisplayValues().slice(1)
    .filter(r => String(r[0]).trim());

  const totalEscolas = escolas.getDataRange().getDisplayValues().slice(1)
    .filter(r => r.some(v => String(v).trim())).length;

  const confirmados = base.filter(r =>
    String(r[3]).trim().toUpperCase() === 'SIM'
  );

  const niveis = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  confirmados.forEach(r => {
    const nivel = String(r[4]).trim().toUpperCase();
    if (nivel in niveis) niveis[nivel]++;
  });

  const idsConfirmados = new Set(
    confirmados.map(r => String(r[0]).trim())
  );

  const docs = registros.getDataRange().getDisplayValues().slice(1)
    .filter(r => idsConfirmados.has(String(r[0]).trim()));

  const validados = new Set(
    docs.filter(r => String(r[1]).trim() === 'Validado')
      .map(r => String(r[0]).trim())
  ).size;

  const recebidos = new Set(
    docs.filter(r =>
      String(r[1]).trim() === 'Recebido — aguardando conferência'
    ).map(r => String(r[0]).trim())
  ).size;

  const correcao = new Set(
    docs.filter(r => String(r[1]).trim() === 'Correção necessária')
      .map(r => String(r[0]).trim())
  ).size;

  const pendentes = Math.max(
    0, confirmados.length - validados - recebidos - correcao
  );

  const doc = DocumentApp.create(
    'SDC | Relatório de situação | ' + competencia
  );
  const body = doc.getBody();

  body.appendParagraph('SCHOOL DIPLOMACY CLUBS')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('Relatório de situação do programa')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph('Competência de referência: ' + competencia);
  body.appendParagraph('Dados extraídos em: ' + dataExtracao);

  body.appendParagraph('1. Resumo executivo')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(
    'O presente documento consolida a situação cadastral, ' +
    'a continuidade dos estudantes e o acompanhamento documental ' +
    'do School Diplomacy Clubs na data de extração. ' +
    'Os indicadores não representam necessariamente a movimentação ' +
    'ocorrida exclusivamente durante a competência.'
  );

  body.appendParagraph('2. Indicadores do programa')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const indicadores = [
    ['Indicador', 'Quantidade'],
    ['Escolas cadastradas', String(totalEscolas)],
    ['Estudantes na base', String(base.length)],
    ['Continuidade confirmada', String(confirmados.length)],
    ['Documentos aguardando conferência', String(recebidos)],
    ['Documentos validados', String(validados)],
    ['Documentos em correção', String(correcao)],
    ['Documentos pendentes', String(pendentes)]
  ];

  body.appendTable(indicadores);

  body.appendParagraph('3. Distribuição por nível CEFR')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendTable([
    ['Nível', 'Estudantes confirmados'],
    ...Object.entries(niveis).map(([nivel, total]) =>
      [nivel, String(total)]
    )
  ]);

  body.appendParagraph('4. Atividades realizadas')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(
    'Preenchimento pela coordenação: registrar atividades, ' +
    'datas, escolas participantes e evidências.'
  );

  body.appendParagraph('5. Dificuldades identificadas')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(
    'Preenchimento pela coordenação: registrar dificuldades ' +
    'pedagógicas, operacionais e documentais.'
  );

  body.appendParagraph('6. Encaminhamentos')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(
    'Preenchimento pela coordenação: registrar responsáveis, ' +
    'prazos e próximos passos.'
  );

  doc.saveAndClose();

  let historico = ss.getSheetByName(SDC_RELATORIOS_ABA);
  if (!historico) {
    historico = ss.insertSheet(SDC_RELATORIOS_ABA);
    historico.appendRow([
      'Competência', 'Data da extração', 'Escolas',
      'Estudantes', 'Confirmados', 'Aguardando conferência',
      'Validados', 'Correção', 'Pendentes', 'Link do relatório'
    ]);
  }

  historico.appendRow([
    competencia, dataExtracao, totalEscolas, base.length,
    confirmados.length, recebidos, validados,
    correcao, pendentes, doc.getUrl()
  ]);

  const resultado = {
    sucesso: true,
    competencia,
    dataExtracao,
    url: doc.getUrl()
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}
