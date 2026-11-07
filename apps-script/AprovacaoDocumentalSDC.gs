/** Portal SDC — módulo de revisão documental (não valida assinaturas).
 * CONFIGURAÇÃO OBRIGATÓRIA: inclua os e-mails institucionais autorizados.
 * Apps Script Web App: executar como VOCÊ; acesso somente à organização/usuários autorizados.
 * Caso Session.getActiveUser().getEmail() retorne vazio, o módulo BLOQUEIA as operações.
 */
const SDC_REVISORES = sdcRevisoresConfig_();

function sdcRevisor_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  const allow = SDC_REVISORES.map(x => x.trim().toLowerCase());
  if (!email || !allow.includes(email)) throw new Error('Acesso à revisão documental não autorizado. Confira o e-mail e a implantação.');
  return email;
}
function sdcDados_() { return SpreadsheetApp.openById(SDC_SPREADSHEET_ID); }
function sdcNormaliza_(s) {return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function sdcLinhas_(sh) { return sh.getDataRange().getDisplayValues(); }
function sdcAuditoria_(ss, evento) {
  let sh = ss.getSheetByName('AUDITORIA_DOCUMENTAL');
  if (!sh) {sh = ss.insertSheet('AUDITORIA_DOCUMENTAL');sh.appendRow(['Data/hora','Revisor','Ação','ID arquivo','ID estudante','Resultado','Observação']);sh.setFrozenRows(1);}
  sh.appendRow(evento);
}
function getTriagemPortalSDC() {
  sdcRevisor_();
  const ss=sdcDados_(), sh=ss.getSheetByName('TRIAGEM_DRIVE');
  if (!sh) throw new Error('Aba TRIAGEM_DRIVE não encontrada');
  return sdcLinhas_(sh).slice(1).filter(r=>r[0]).map(r=>({
    arquivoId:r[0], arquivo:r[1], url:r[2], pasta:r[3], idSugerido:r[6], estudante:r[7], resultado:r[8], revisao:r[9]||'PENDENTE', observacao:r[10]
  }));
}
/** decisão = APROVAR ou REJEITAR; ID deve vir da sugestão já registrada.
 * APROVAR significa somente: o documento pertence ao estudante (assinatura não conferida).
 */
function decidirTriagemPortalSDC(arquivoId, decisao, observacao) {
  const revisor=sdcRevisor_();
  if (!['APROVAR','REJEITAR'].includes(decisao)) throw new Error('Decisão inválida');
  arquivoId=String(arquivoId||'').trim();
  observacao=String(observacao||'').trim().slice(0,500);
  if (!arquivoId) throw new Error('Arquivo não informado');
  if (!observacao) throw new Error('Registre uma justificativa da revisão');
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('Outra revisão está em andamento; tente novamente.');
  try {
    const ss=sdcDados_(), tri=ss.getSheetByName('TRIAGEM_DRIVE'), reg=ss.getSheetByName('REGISTRO_DOCUMENTOS'), base=ss.getSheetByName('ALUNOS_BASE');
    if (!tri||!reg||!base) throw new Error('Abas obrigatórias não encontradas');
    const linhas=sdcLinhas_(tri), idx=linhas.findIndex((r,i)=>i>0 && r[0]===arquivoId);
    if(idx<1) throw new Error('Arquivo não localizado na triagem');
    const r=linhas[idx], row=idx+1;
    if (String(r[9]||'PENDENTE').trim().toUpperCase()!=='PENDENTE') throw new Error('Arquivo já revisado; atualize a tela');
    const id=String(r[6]||'').trim(), nome=String(r[7]||'').trim();
    if(decisao==='APROVAR') {
      if(!id || !nome || r[8]!=='SUGESTÃO ÚNICA — conferir documento') throw new Error('Aprovação requer sugestão única previamente validada');
      const alunos=sdcLinhas_(base).slice(1).filter(a=>String(a[0]).trim()===id);
     if (alunos.length !== 1 ||String(alunos[0][3] || '').trim().toUpperCase() !== 'SIM' ||sdcNormaliza_(alunos[0][1]) !== sdcNormaliza_(r[3]) ||sdcNormaliza_(alunos[0][2]) !== sdcNormaliza_(nome)) { throw new Error('Dados do estudante não conferem com a base atual');}
      const jaRegistrados=sdcLinhas_(reg).slice(1).filter(a=>String(a[0]).trim()===id || (a[2] && String(a[2]).includes(arquivoId)));
      if(jaRegistrados.length) throw new Error('Documento ou estudante já consta no registro; revisar duplicidade manualmente');
      const duplicados=linhas.slice(1).filter((a,i)=>i!==idx-1 && String(a[6]).trim()===id && String(a[9]).trim().toUpperCase()==='APROVADO');
      if(duplicados.length) throw new Error('Estudante já possui outro vínculo aprovado');
      if(!/^https:\/\/drive\.google\.com\//.test(String(r[2]))) throw new Error('URL do Drive inválida');
      // Registro primeiro; sem validação de assinatura.
      reg.appendRow([id,'Recebido — aguardando conferência',r[2],'Não conferida','',`Vínculo conferido por ${revisor} em ${new Date().toISOString()}. ${observacao}`]);
    }
    const estado=decisao==='APROVAR'?'APROVADO':'REJEITADO';
    tri.getRange(row,10).setValue(estado);
    tri.getRange(row,11).setValue(`${observacao} | ${revisor} | ${new Date().toISOString()}`);
    sdcAuditoria_(ss,[new Date(),revisor,decisao,arquivoId,id,estado,observacao]);
    return {ok:true,estado,arquivoId,id,nota:'Assinatura não validada'};
  } finally {lock.releaseLock();}
}
