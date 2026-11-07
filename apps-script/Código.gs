  const SDC_SPREADSHEET_ID = sdcConfig_('SDC_SPREADSHEET_ID');

function doGet(e) {
  try {
    sdc20Autorizar_();
  } catch (erro) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:Arial;padding:35px">' +
      '<h2>Acesso não autorizado</h2>' +
      '<p>Esta conta não possui permissão para acessar o Portal SDC.</p>' +
      '</div>'
    ).setTitle('SDC | Acesso restrito');
  }

  if (e && e.parameter && e.parameter.tela === 'piloto') {
    return paginaPilotoSDC_();
  }

  const template = HtmlService.createTemplateFromFile('Index');
  template.SDC_PILOT_URL = ScriptApp.getService().getUrl() + '?tela=piloto';
  return template.evaluate()
    .setTitle('Portal de Gestão | SDC 2026–2027');
}

function getPortalData() { 
  sdc20Autorizar_();
  
  const ss = SpreadsheetApp.openById(SDC_SPREADSHEET_ID);
  const base = readObjects_(ss, 'ALUNOS_BASE');
  const escolas = readObjects_(ss, 'ESCOLAS');
  const docs = readObjects_(ss, 'REGISTRO_DOCUMENTOS');
  const docMap = {};
  docs.forEach(d => {
    const id = String(d['ID do estudante'] || d['ID'] || '').trim();
    if (id) docMap[id] = d;
  });
  const students = base.filter(s => s['ID'] !== '' && s['ID'] != null).map(s => {
    const id = String(s['ID']).trim();
    const doc = docMap[id] || {};
    return {
      id,
      escola: String(s['Escola'] || ''),
      cefr: String(s['Nível CEFR'] || ''),
      continuidade: String(s['Permanece 2026-2027?'] || '').trim().toUpperCase(),
      situacao: String(doc['Situação documental'] || 'Não recebido'),
      conferencia: String(doc['Conferência da assinatura'] || 'Não conferida')
    };
  });
  const ativos = students.filter(s => s.continuidade === 'SIM');
  const received = ativos.filter(s => s.situacao === 'Recebido — aguardando conferência').length;
  const validated = ativos.filter(s => s.situacao === 'Validado' && s.conferencia === 'Assinatura válida').length;
  const correction = ativos.filter(s => s.situacao === 'Correção necessária').length;
  const cefr = {};
  ativos.forEach(s => { const k = s.cefr || 'Não informado'; cefr[k] = (cefr[k] || 0) + 1; });
  return {
    updatedAt: new Date().toISOString(),
    kpis: {escolas: escolas.length, estudantes: students.length, confirmados: ativos.length, recebidos: received, validados: validated, correcao: correction, pendentes: ativos.length - received - validated - correction},
    cefr,
    escolas: [...new Set(students.map(s => s.escola).filter(Boolean))].sort(),
    students: ativos
  };
}

function readObjects_(ss, tab) {
  const sh = ss.getSheetByName(tab);
  if (!sh) throw new Error('Aba não encontrada: ' + tab);
  const data = sh.getDataRange().getDisplayValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => h.trim());
  return data.slice(1).filter(r => r.some(v => v !== '')).map(row => Object.fromEntries(headers.map((h,i) => [h, row[i] || ''])));
}
