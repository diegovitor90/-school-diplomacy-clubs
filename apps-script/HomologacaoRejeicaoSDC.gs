
/** TESTE CONTROLADO de rejeição: não usa estudantes ou arquivos reais. */
const SDC_TESTE_REJEICAO_ID = 'SDC_TESTE_REJEICAO_20261025';

function prepararTesteRejeicaoSDC() {
  sdcRevisor_();

  const ss = sdcDados_();
  const sh = ss.getSheetByName('TRIAGEM_DRIVE');

  if (!sh) throw new Error('TRIAGEM_DRIVE não encontrada');

  const linhas = sh.getDataRange().getDisplayValues();

  if (linhas.some((r, i) =>
    i > 0 && r[0] === SDC_TESTE_REJEICAO_ID
  )) {
    return 'Registro fictício já existe. Atualize a triagem no portal.';
  }

  sh.appendRow([
    SDC_TESTE_REJEICAO_ID,
    '[TESTE] Documento fictício - rejeição',
    '',
    'ESCOLA FICTÍCIA — HOMOLOGAÇÃO',
    'Registro criado para teste de rejeição',
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'dd/MM/yyyy'
    ),
    '',
    '',
    'SEM CORRESPONDÊNCIA EXATA',
    'PENDENTE',
    'TESTE CONTROLADO — NÃO É DOCUMENTO DE ESTUDANTE'
  ]);

  return 'Registro fictício criado. Abra o Portal e teste a rejeição.';
}

function verificarTesteRejeicaoSDC() {
  sdcRevisor_();

  const ss = sdcDados_();

  const tri = ss.getSheetByName('TRIAGEM_DRIVE')
    .getDataRange().getDisplayValues();

  const reg = ss.getSheetByName('REGISTRO_DOCUMENTOS')
    .getDataRange().getDisplayValues();

  const aud = ss.getSheetByName('AUDITORIA_DOCUMENTAL')
    .getDataRange().getDisplayValues();

  const t = tri.find(r => r[0] === SDC_TESTE_REJEICAO_ID);
  const a = aud.filter(r => r[3] === SDC_TESTE_REJEICAO_ID);

  const indevido = reg.some(r =>
    r.some(v => String(v).includes(SDC_TESTE_REJEICAO_ID))
  );

  const aprovado = !!t &&
    t[9] === 'REJEITADO' &&
    a.some(r =>
      r[2] === 'REJEITAR' &&
      r[5] === 'REJEITADO'
    ) &&
    !indevido;

  const resultado = {
    testeAprovado: aprovado,
    estadoTriagem: t ? t[9] : 'NÃO ENCONTRADO',
    eventosAuditoria: a.length,
    registroDocumentalIndevido: indevido
  };

  Logger.log(JSON.stringify(resultado));
  return resultado;
}

function limparRegistroFicticioSDC() {
  sdcRevisor_();

  const sh = sdcDados_()
    .getSheetByName('TRIAGEM_DRIVE');

  const dados = sh.getDataRange().getDisplayValues();

  const i = dados.findIndex((r, n) =>
    n > 0 && r[0] === SDC_TESTE_REJEICAO_ID
  );

  if (i < 1) return 'Nenhuma linha fictícia encontrada';

  if (dados[i][9] !== 'REJEITADO') {
    throw new Error('Rejeite o registro de teste antes de limpar');
  }

  sh.deleteRow(i + 1);

  return 'Linha fictícia removida; auditoria preservada.';
}
