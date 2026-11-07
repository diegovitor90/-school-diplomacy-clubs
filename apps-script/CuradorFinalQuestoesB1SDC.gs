
/**
 * SDC 1.7 — Curadoria final do piloto B1
 * Gera um caderno para revisão humana.
 * Não aprova nenhuma questão.
 */

function gerarCadernoRevisaoB1SDC() {
  sdcRevisor_();

  const ids = [
    'SDC-Q0002',
    'SDC-Q0003',
    'SDC-Q0004',
    'SDC-Q0005',
    'SDC-Q0006'
  ];

  const doc = DocumentApp.create(
    'SDC | Caderno de Curadoria | Piloto B1'
  );

  const body = doc.getBody();

  body.appendParagraph(
    'SCHOOL DIPLOMACY CLUBS'
  ).setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph(
    'Caderno de Revisão Pedagógica — B1'
  ).setHeading(DocumentApp.ParagraphHeading.HEADING1);

  body.appendParagraph(
    'Documento de uso interno. As questões precisam ' +
    'de conferência pedagógica antes da aprovação.'
  );

  ids.forEach((id, indice) => {
    const q = consultarQuestaoCuradoriaSDC(id);

    body.appendParagraph(
      (indice + 1) + '. ' + id + ' — ' + q.habilidade
    ).setHeading(DocumentApp.ParagraphHeading.HEADING2);

    body.appendParagraph('Tema: ' + q.tema);
    body.appendParagraph('Nível proposto: ' + q.nivel);
    body.appendParagraph('Contexto: ' + q.contexto);
    body.appendParagraph('Pergunta: ' + q.enunciado);

    ['A', 'B', 'C', 'D'].forEach((letra, i) => {
      body.appendParagraph(
        letra + ') ' + q.alternativas[i]
      );
    });

    body.appendParagraph(
      'Gabarito: ' + q.gabarito
    );

    body.appendParagraph(
      'Justificativa: ' + q.justificativa
    );

    body.appendParagraph(
      'CONFERÊNCIA PEDAGÓGICA'
    ).setHeading(DocumentApp.ParagraphHeading.HEADING3);

    body.appendParagraph(
      'Enunciado claro? [ ] Sim [ ] Não'
    );

    body.appendParagraph(
      'Distratores adequados? [ ] Sim [ ] Não'
    );

    body.appendParagraph(
      'Gabarito correto? [ ] Sim [ ] Não'
    );

    body.appendParagraph(
      'Adequação ao B1? [ ] Sim [ ] Revisar'
    );

    body.appendParagraph(
      'Parecer do revisor: _______________________'
    );
  });

  doc.saveAndClose();

  const resultado = {
    sucesso: true,
    questoes: ids.length,
    documento: doc.getUrl(),
    status: 'Aguardando revisão humana'
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}
