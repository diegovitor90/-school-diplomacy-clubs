import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,readdirSync} from 'node:fs';
const files=readdirSync('apps-script').filter(n=>n.endsWith('.gs'));
const source=files.map(n=>readFileSync('apps-script/'+n,'utf8')).join('\n');
function context(email='',props={}){
 const c=vm.createContext({console,PropertiesService:{getScriptProperties:()=>({getProperty:n=>props[n]??null})},Session:{getActiveUser:()=>({getEmail:()=>email})}});
 vm.runInContext(source,c);return c;
}
test('all server files compile together without duplicate declarations',()=>{new vm.Script(source);assert.equal(files.length,20);});
test('missing allowlist and unidentified accounts deny access',()=>{
 for(const email of ['', 'outsider@example.invalid']){
  const c=context(email);assert.throws(()=>c.sdcRevisor_());assert.throws(()=>c.sdc20Autorizar_());assert.throws(()=>c.getPortalData());
 }
});
test('configured reviewer is normalized and authorized',()=>{
 const c=context(' Reviewer@example.invalid ',{SDC_REVIEWER_EMAILS:' Reviewer@example.invalid , '});
 assert.equal(c.sdc20Autorizar_(),'reviewer@example.invalid');
});
test('dashboard requires a valid signature and omits student names',()=>{
 const c=context('reviewer@example.invalid',{SDC_REVIEWER_EMAILS:'reviewer@example.invalid',SDC_SPREADSHEET_ID:'test-sheet'});
 const rows={ALUNOS_BASE:[['ID','Escola','Nome','Permanece 2026-2027?','Nível CEFR'],['1','Escola fictícia','Pessoa teste','SIM','B1'],['2','Escola fictícia','Outra pessoa','SIM','A2'],['3','Escola fictícia','Inativo','NAO','A1']],ESCOLAS:[['Escola'],['Escola fictícia']],REGISTRO_DOCUMENTOS:[['ID do estudante','Situação documental','Conferência da assinatura'],['1','Validado','Assinatura válida'],['2','Validado','Não conferida']]};
 c.SpreadsheetApp={openById:id=>{assert.equal(id,'test-sheet');return{getSheetByName:n=>({getDataRange:()=>({getDisplayValues:()=>rows[n]})})};}};
 const out=c.getPortalData();assert.equal(out.kpis.confirmados,2);assert.equal(out.kpis.validados,1);assert.equal(out.kpis.pendentes,1);assert.equal(out.students.length,2);assert.ok(!JSON.stringify(out).includes('Pessoa teste'));
});
test('assessment payload excludes the answer key',()=>{
 const c=context();c.sdcQuestoesWebInternas_=()=>[{id:'test',habilidade:'Reading',contexto:'Text',enunciado:'Question',alternativas:{A:'One',B:'Two'},gabarito:'A'}];
 const out=c.obterAvaliacaoWebSDC();assert.equal(out.questoes.length,1);assert.ok(!('gabarito' in out.questoes[0]));
});
test('invalid review decisions cannot reach storage',()=>{
 const c=context('reviewer@example.invalid',{SDC_REVIEWER_EMAILS:'reviewer@example.invalid'});
 assert.throws(()=>c.decidirTriagemPortalSDC('test','DELETE','reason'),/Decisão inválida/);
 assert.throws(()=>c.decidirAssinaturaSDC('test','APPROVE','reason'),/Decisão inválida/);
});
