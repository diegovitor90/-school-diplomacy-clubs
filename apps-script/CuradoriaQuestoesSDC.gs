

/**
 * PORTAL SDC 1.6
 * CURADORIA PEDAGÓGICA DO BANCO DE QUESTÕES
 *
 * Dependências:
 * - sdcDados_()
 * - sdcRevisor_()
 * - Aba QUESTOES_SDC
 *
 * Não altera gabaritos ou textos das questões.
 */

const SDC_CUR_ABA = 'AUDITORIA_QUESTOES_SDC';

function configurarCuradoriaSDC() {
  sdcRevisor_();

  const ss = sdcDados_();
  const questoes = ss.getSheetByName('QUESTOES_SDC');

  if (!questoes) {
    throw new Error(
      'Execute configurarBancoQuestoesSDC primeiro.'
    );
  }

  let audit = ss.getSheetByName(SDC_CUR_ABA);

  const cabecalhos = [
    'Data e hora',
    'Revisor',
    'ID da questao',
    'Acao',
    'Status anterior',
    'Status novo',
    'Justificativa'
  ];

  if (!audit) {
    audit = ss.insertSheet(SDC_CUR_ABA);

    audit.getRange(1, 1, 1, cabecalhos.length)
      .setValues([cabecalhos]);

    audit.setFrozenRows(1);

    audit.getRange(1, 1, 1, cabecalhos.length)
      .setFontWeight('bold')
      .setBackground('#e8efff');

  } else {
    const atual = audit
      .getRange(1, 1, 1, cabecalhos.length)
      .getDisplayValues()[0];

    if (atual.join('|') !== cabecalhos.join('|')) {
      throw new Error(
        'A aba de auditoria possui cabeçalhos diferentes.'
      );
    }
  }

  return audit;
}

/**
 * Consulta uma questão.
 * Não altera dados.
 */
function consultarQuestaoCuradoriaSDC(id) {
  sdcRevisor_();

  const aba = sdcDados_()
    .getSheetByName('QUESTOES_SDC');

  if (!aba) throw new Error('Banco não encontrado.');

  const dados = aba.getDataRange().getDisplayValues();

  const r = dados.slice(1).find(
    linha => String(linha[0]).trim() === id
  );

  if (!r) throw new Error('Questão não encontrada.');

  return {
    id: r[0],
    nivel: r[1],
    habilidade: r[2],
    tema: r[3],
    contexto: r[4],
    enunciado: r[5],
    alternativas: r.slice(6, 10),
    gabarito: r[10],
    justificativa: r[11],
    dificuldade: r[12],
    status: r[13],
    autoria: r[14]
  };
}

/**
 * Registra uma decisão de curadoria.
 *
 * APROVAR: libera a questão para montagem de provas.
 * REVISAR: mantém ou devolve a questão para revisão.
 */
function decidirCuradoriaQuestaoSDC(
  id,
  decisao,
  justificativa
) {
  const emailAutorizado = sdcRevisor_();

  id = String(id || '').trim();
  decisao = String(decisao || '').trim().toUpperCase();
  justificativa = String(justificativa || '').trim();

  if (!/^SDC-Q\d{4,}$/.test(id)) {
    throw new Error('ID de questão inválido.');
  }

  if (!['APROVAR', 'REVISAR'].includes(decisao)) {
    throw new Error('Decisão inválida.');
  }

  if (justificativa.length < 15) {
    throw new Error(
      'Registre uma justificativa com pelo menos 15 caracteres.'
    );
  }

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(15000)) {
    throw new Error('Outra operação está em andamento.');
  }

  try {
    const ss = sdcDados_();
    const aba = ss.getSheetByName('QUESTOES_SDC');

    if (!aba) throw new Error('Banco não encontrado.');

    const auditoria = configurarCuradoriaSDC();
    const dados = aba.getDataRange().getValues();

    const indice = dados.findIndex(
      (r, i) => i > 0 && String(r[0]).trim() === id
    );

    if (indice < 1) {
      throw new Error('Questão não encontrada: ' + id);
    }

    const linha = indice + 1;
    const questao = dados[indice];

    const statusAnterior = String(questao[13]).trim();

    if (statusAnterior === 'Arquivada') {
      throw new Error(
        'Questão arquivada não pode ser alterada por esta função.'
      );
    }

    if (decisao === 'APROVAR') {

      if (statusAnterior !== 'Em revisao') {
        throw new Error(
          'A aprovação exige status Em revisao.'
        );
      }

      const obrigatorios = [
        1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12
      ];

      if (obrigatorios.some(
        col => !String(questao[col] || '').trim()
      )) {
        throw new Error(
          'Questão incompleta. Confira todos os campos.'
        );
      }

      if (!['A', 'B', 'C', 'D'].includes(
        String(questao[10]).trim().toUpperCase()
      )) {
        throw new Error('Gabarito inválido.');
      }
    }

    const statusNovo = decisao === 'APROVAR'
      ? 'Aprovada'
      : 'Em revisao';

    const revisor = String(
      emailAutorizado ||
      Session.getActiveUser().getEmail() ||
      'Conta autorizada'
    );

    const agora = new Date();

    // Primeiro registra a decisão na auditoria.
    const linhaAuditoria = auditoria.getLastRow() + 1;

    auditoria.appendRow([
      agora,
      revisor,
      id,
      decisao,
      statusAnterior,
      statusNovo,
      justificativa
    ]);

    // Atualiza a questão. Em caso de erro,
    // a operação fica registrada para reconciliação.
    try {
      aba.getRange(linha, 14).setValue(statusNovo);
      aba.getRange(linha, 17).setValue(agora);
      SpreadsheetApp.flush();

    } catch (erro) {
      auditoria.getRange(linhaAuditoria, 4)
        .setValue('ERRO_NA_ATUALIZACAO_' + decisao);

      throw erro;
    }

    const resultado = {
      sucesso: true,
      id: id,
      decisao: decisao,
      statusAnterior: statusAnterior,
      statusNovo: statusNovo,
      revisor: revisor
    };

    console.log(JSON.stringify(resultado));

    return resultado;

  } finally {
    lock.releaseLock();
  }
}

/**
 * TESTE 1 — apenas consulta.
 * Não modifica a questão piloto.
 */
function testarCuradoriaSDC() {
  configurarCuradoriaSDC();

  const questao = consultarQuestaoCuradoriaSDC(
    'SDC-Q0001'
  );

  console.log(JSON.stringify({
    sucesso: true,
    id: questao.id,
    nivel: questao.nivel,
    status: questao.status,
    auditoriaConfigurada: true
  }));
}

/**
 * TESTE 2 — solicita revisão pedagógica.
 * Mantém a questão fora das provas aprovadas.
 */
function solicitarRevisaoPilotoSDC() {
  return decidirCuradoriaQuestaoSDC(
    'SDC-Q0001',
    'REVISAR',
    'Questão piloto: revisar a complexidade linguística, ' +
    'a qualidade dos distratores e a classificação CEFR B1.'
  );
}

/**
 * Aprovação manual da questão piloto.
 *
 * Execute SOMENTE após revisão pedagógica
 * efetiva do enunciado, gabarito, distratores
 * e adequação ao nível CEFR.
 */
function aprovarQuestaoPilotoSDC() {
  return decidirCuradoriaQuestaoSDC(
    'SDC-Q0001',
    'APROVAR',
    'Revisão pedagógica concluída. Enunciado, ' +
    'alternativas, gabarito e adequação ao nível ' +
    'CEFR foram conferidos.'
  );
}
