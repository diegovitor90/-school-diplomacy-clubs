/** SDC — sugestões seguras por nome e escola. Não altera o registro documental.
 * Adicione este arquivo ao projeto Apps Script Portal SDC — MVP 1.0.
 */
function sugerirVinculosTriagemSDC() {
  const ss = SpreadsheetApp.openById(sdcConfig_('SDC_SPREADSHEET_ID'));
  const alunos = ss.getSheetByName('ALUNOS_BASE');
  const triagem = ss.getSheetByName('TRIAGEM_DRIVE');
  const reg = ss.getSheetByName('REGISTRO_DOCUMENTOS');
  if (!alunos || !triagem || !reg) throw new Error('Uma das abas necessárias não foi encontrada.');
  const clean = v => String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const base = alunos.getDataRange().getDisplayValues().slice(1).filter(r => r[0] && r[2] && clean(r[3]) === 'SIM')
    .map(r => ({id:String(r[0]).trim(), escola:clean(r[1]), nome:clean(r[2]), nomeOriginal:r[2]}));
  const existentes = new Set(reg.getDataRange().getDisplayValues().slice(1).map(r => String(r[0]).trim()).filter(Boolean));
  const data = triagem.getDataRange().getDisplayValues();
  const headers = [['ID sugerido','Estudante sugerido','Resultado da análise','Revisão humana','Observação da triagem']];
  triagem.getRange(1,7,1,5).setValues(headers).setFontWeight('bold');
  if (data.length <= 1) { console.log('Nenhum arquivo em triagem.'); return; }
  const result = [];
  const usedSuggestions = new Map();
  for (const r of data.slice(1)) {
    const fileName = String(r[1]||'');
    const pasta = clean(r[3]);
    const nomeArquivo = clean(fileName.replace(/\.pdf$/i,'').replace(/\s*\(\d+\)\s*$/,'').replace(/\b(ASSINADO|ASSINADA|AUTORIZACAO|TERMO|CONSENTIMENTO|SDC|PDF|2026|2027)\b/gi,' '));
    // Correspondência conservadora: nome completo exatamente igual ao nome do arquivo,
    // ou nome completo contido como sequência integral no nome do arquivo.
    const matches = base.filter(s => s.escola === pasta && s.nome.length >= 12 &&
      (nomeArquivo === s.nome || (' ' + nomeArquivo + ' ').includes(' ' + s.nome + ' ')));
    if (matches.length === 1) {
      const s = matches[0];
      usedSuggestions.set(s.id, (usedSuggestions.get(s.id)||0)+1);
      result.push([s.id,s.nomeOriginal,existentes.has(s.id)?'JÁ REGISTRADO — verificar duplicidade':'SUGESTÃO ÚNICA — conferir documento','PENDENTE','Conferir identidade e assinatura no PDF antes de qualquer vínculo']);
    } else if (matches.length > 1) {
      result.push(['','','AMBÍGUO — múltiplos estudantes','PENDENTE','Exige identificação manual']);
    } else {
      result.push(['','','SEM CORRESPONDÊNCIA EXATA','PENDENTE','Verificar nome, escola e se o estudante continua no SDC']);
    }
  }
  // Se mais de um arquivo sugerir o mesmo estudante, não aprovar automaticamente.
  for (const r of result) if (r[0] && usedSuggestions.get(r[0]) > 1 && !r[2].startsWith('JÁ REGISTRADO')) {
    r[2] = 'POSSÍVEL DUPLICIDADE — conferir arquivos';
  }
  // Preservar decisões humanas e observações já registradas em J:K.
  for (let i=0; i<result.length; i++) {
    const revisao=String(data[i+1][9]||'').trim().toUpperCase();
    if (revisao==='APROVADO' || revisao==='REJEITADO') {
      result[i][3]=data[i+1][9];
      result[i][4]=data[i+1][10];
    }
  }
  triagem.getRange(2,7,result.length,5).setValues(result);
  triagem.autoResizeColumns(7,5);
  console.log(JSON.stringify({analisados:result.length,sugestoesUnicas:result.filter(r=>r[2]==='SUGESTÃO ÚNICA — conferir documento').length,semCorrespondencia:result.filter(r=>r[2]==='SEM CORRESPONDÊNCIA EXATA').length,ambiguosOuDuplicados:result.filter(r=>/AMBÍGUO|DUPLICIDADE/.test(r[2])).length}));
}
