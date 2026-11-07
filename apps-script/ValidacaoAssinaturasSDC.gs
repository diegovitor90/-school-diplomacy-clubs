/** Portal SDC 1.2 — segunda etapa: conferência humana da assinatura.
 * Reutiliza SDC_SPREADSHEET_ID, sdcDados_, sdcRevisor_, sdcLinhas_,
 * sdcAuditoria_ e sdcNormaliza_ do módulo AprovacaoDocumentalSDC.gs.
 * Não redefine SDC_REVISORES. Não interpreta PDFs automaticamente.
 */
function listarAssinaturasSDC() {
  sdcRevisor_();
  const ss=sdcDados_(), reg=ss.getSheetByName('REGISTRO_DOCUMENTOS'), base=ss.getSheetByName('ALUNOS_BASE'), tri=ss.getSheetByName('TRIAGEM_DRIVE');
  if(!reg||!base||!tri) throw new Error('Abas documentais não encontradas');
  const alunos=new Map(sdcLinhas_(base).slice(1).map(r=>[String(r[0]).trim(),r]));
  const aprovados=sdcLinhas_(tri).slice(1).filter(r=>String(r[9]).trim()==='APROVADO');
  const regs=sdcLinhas_(reg).slice(1);
  return aprovados.map(t=>{
    const id=String(t[6]).trim(), a=alunos.get(id), hits=regs.filter(r=>String(r[0]).trim()===id && String(r[2]).includes(t[0]));
    return {arquivoId:t[0],id,arquivo:t[1],url:t[2],estudante:a?a[2]:'',escola:a?a[1]:'',situacao:hits.length===1?hits[0][1]:'INCONSISTÊNCIA',assinatura:hits.length===1?hits[0][3]:'INCONSISTÊNCIA',elegivel:hits.length===1 && hits[0][1]==='Recebido — aguardando conferência' && hits[0][3]==='Não conferida'};
  });
}
function decidirAssinaturaSDC(arquivoId, decisao, justificativa) {
  const revisor=sdcRevisor_();
  if(!['VALIDAR','CORRECAO'].includes(decisao)) throw new Error('Decisão inválida');
  arquivoId=String(arquivoId||'').trim();
  justificativa=String(justificativa||'').trim().slice(0,500);
  if(!arquivoId||justificativa.length<12) throw new Error('Informe arquivo e justificativa com pelo menos 12 caracteres');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(15000)) throw new Error('Outra revisão está em andamento; tente novamente');
  try {
    const ss=sdcDados_(), tri=ss.getSheetByName('TRIAGEM_DRIVE'), reg=ss.getSheetByName('REGISTRO_DOCUMENTOS'), base=ss.getSheetByName('ALUNOS_BASE');
    if(!tri||!reg||!base) throw new Error('Abas obrigatórias ausentes');
    const ts=sdcLinhas_(tri).slice(1).filter(r=>r[0]===arquivoId);
    if(ts.length!==1||String(ts[0][9]).trim()!=='APROVADO') throw new Error('Vínculo não aprovado ou ambíguo');
    const t=ts[0],id=String(t[6]).trim(),alunos=sdcLinhas_(base).slice(1).filter(r=>String(r[0]).trim()===id);
    if(alunos.length!==1 || String(alunos[0][3]).trim().toUpperCase()!=='SIM' || sdcNormaliza_(alunos[0][2])!==sdcNormaliza_(t[7]) || sdcNormaliza_(alunos[0][1])!==sdcNormaliza_(t[3])) throw new Error('Estudante ou escola não conferem');
    const rs=sdcLinhas_(reg), hits=[];
    for(let i=1;i<rs.length;i++) if(String(rs[i][0]).trim()===id && String(rs[i][2]).includes(arquivoId)) hits.push({row:i+1,r:rs[i]});
    if(hits.length!==1) throw new Error('Registro documental ausente ou duplicado');
    const h=hits[0];
    if(h.r[1]!=='Recebido — aguardando conferência'||h.r[3]!=='Não conferida') throw new Error('Assinatura já decidida ou registro alterado; atualize a tela');
    const situacao=decisao==='VALIDAR'?'Validado':'Correção necessária';
    const assinatura=decisao==='VALIDAR'?'Assinatura válida':'Revisar assinatura';
    const agora=new Date();
    const observacao=`${h.r[5]||''} | Conferência da assinatura por ${revisor} em ${agora.toISOString()}: ${justificativa}`;
    // Grava situação, assinatura, data e histórico na mesma linha existente.
    reg.getRange(h.row,2,1,5).setValues([[situacao,h.r[2],assinatura,agora,observacao]]);
    sdcAuditoria_(ss,[agora,revisor,decisao==='VALIDAR'?'VALIDAR_ASSINATURA':'SOLICITAR_CORRECAO_ASSINATURA',arquivoId,id,situacao,justificativa]);
    return {ok:true,id,situacao,assinatura};
  } finally {lock.releaseLock();}
}
