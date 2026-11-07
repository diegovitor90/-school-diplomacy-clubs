/** SDC | Recebimento documental seguro — adicionar como novo arquivo ao projeto Portal SDC.
 * A primeira execução deve ser feita manualmente. Não valida assinaturas.
 */
const SDC_DOC_CONFIG = Object.freeze({
  spreadsheetId: sdcConfig_('SDC_SPREADSHEET_ID'),
  rootFolderId: sdcConfig_('SDC_DOCUMENTS_FOLDER_ID'),
  registrySheet: 'REGISTRO_DOCUMENTOS',
  studentsSheet: 'ALUNOS_BASE',
  reviewSheet: 'TRIAGEM_DRIVE',
  maxFilesPerRun: 400
});

function sincronizarTermosSDC() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Outra sincronização está em andamento.');
  try {
    const c = SDC_DOC_CONFIG;
    const ss = SpreadsheetApp.openById(c.spreadsheetId);
    const alunos = ss.getSheetByName(c.studentsSheet);
    const reg = ss.getSheetByName(c.registrySheet);
    if (!alunos || !reg) throw new Error('Abas ALUNOS_BASE ou REGISTRO_DOCUMENTOS não encontradas.');
    let triagem = ss.getSheetByName(c.reviewSheet);
    if (!triagem) {
      triagem = ss.insertSheet(c.reviewSheet);
      triagem.appendRow(['ID arquivo Drive', 'Arquivo', 'URL', 'Pasta', 'Motivo', 'Data da identificação']);
      triagem.setFrozenRows(1);
    }
    const base = alunos.getDataRange().getValues();
    const ids = new Set();
    for (let i = 1; i < base.length; i++) {
      if (String(base[i][3]).trim().toUpperCase() === 'SIM') ids.add(String(base[i][0]).trim());
    }
    const registros = reg.getDataRange().getValues();
    const registered = new Set();
    const knownFileIds = new Set();
    for (let i = 1; i < registros.length; i++) {
      const id = String(registros[i][0] || '').trim();
      if (id) registered.add(id);
      const url = String(registros[i][2] || '');
      const match = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
      if (match) knownFileIds.add(match[1]);
    }
    const reviewed = triagem.getDataRange().getValues();
    const reviewedFileIds = new Set(reviewed.slice(1).map(r => String(r[0])));
    const queue = [{ folder: DriveApp.getFolderById(c.rootFolderId), depth: 0 }];
    const newRecords = [], newReview = [];
    let examined = 0;
    while (queue.length && examined < c.maxFilesPerRun) {
      const item = queue.shift();
      const folder = item.folder;
      const files = folder.getFiles();
      while (files.hasNext() && examined < c.maxFilesPerRun) {
        const file = files.next();
        examined++;
        const fid = file.getId();
        if (knownFileIds.has(fid) || reviewedFileIds.has(fid)) continue;
        const name = file.getName();
        // Nome obrigatório: SDC_2027_ID0200_TERMO.pdf (aceita também SDC_ID200_TERMO.pdf).
        const matches = [...name.matchAll(/(?:^|[_\s-])ID0*(\d{1,6})(?=[_\s.\-]|$)/gi)];
        const candidates = [...new Set(matches.map(m => String(Number(m[1]))))];
        let reason = '';
        if (!/\.pdf$/i.test(name)) reason = 'Arquivo não é PDF';
        else if (candidates.length !== 1) reason = 'ID ausente ou ambíguo no nome';
        else if (!ids.has(candidates[0])) reason = 'ID não corresponde a estudante com continuidade SIM';
        else if (registered.has(candidates[0])) reason = 'Estudante já tem registro documental; verificar duplicidade/substituição';
        const url = file.getUrl();
        if (reason) {
          newReview.push([fid, name, url, folder.getName(), reason, new Date()]);
          reviewedFileIds.add(fid);
        } else {
          const id = candidates[0];
          newRecords.push([Number(id), 'Recebido — aguardando conferência', url, 'Não conferida', '', 'Identificado automaticamente pelo ID no nome do arquivo; assinatura não verificada.']);
          registered.add(id);
          knownFileIds.add(fid);
        }
      }
      const subfolders = folder.getFolders();
      while (subfolders.hasNext()) queue.push({ folder: subfolders.next(), depth: item.depth + 1 });
    }
    if (newRecords.length) reg.getRange(reg.getLastRow() + 1, 1, newRecords.length, 6).setValues(newRecords);
    if (newReview.length) triagem.getRange(triagem.getLastRow() + 1, 1, newReview.length, 6).setValues(newReview);
    const result = { examinados: examined, vinculados: newRecords.length, enviadosParaTriagem: newReview.length, limiteAtingido: examined >= c.maxFilesPerRun };
    console.log(JSON.stringify(result));
    return result;
  } finally { lock.releaseLock(); }
}

/** Execute uma única vez, depois de testar a sincronização manualmente. */
function ativarSincronizacaoTermosSDC() {
  const functionName = 'sincronizarTermosSDC';
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === functionName).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(functionName).timeBased().everyHours(1).create();
  console.log('Acionador criado: sincronização aproximadamente a cada hora.');
}
