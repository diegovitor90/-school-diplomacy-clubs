import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const code = readFileSync(new URL('../demo/adapter.js', import.meta.url), 'utf8');
function api() {
  const context = { window: {}, queueMicrotask, structuredClone };
  vm.runInNewContext(code, context);
  return context.window.google.script;
}
function call(api, name) { return new Promise((resolve, reject) => api.run.withSuccessHandler(resolve).withFailureHandler(reject)[name]()); }
test('synthetic indicators reconcile with the student list', async () => {
  const d = await call(api(), 'getPortalData');
  assert.equal(d.students.length, d.kpis.confirmados);
  assert.equal(d.kpis.validados + d.kpis.recebidos + d.kpis.pendentes + d.kpis.correcao, d.kpis.confirmados);
  assert.equal(Object.values(d.cefr).reduce((a, b) => a + b), d.kpis.confirmados);
  assert.equal(new Set(d.students.map(s => s.id)).size, d.students.length);
});
test('write and administrative calls fail closed in demo', async () => {
  for (const method of ['decidirTriagemPortalSDC', 'decidirAssinaturaSDC', 'gerarPlanoGestaoSDC', 'gerarRelatorioGestaoSDC', 'obterAdministrativoSDC']) {
    await assert.rejects(call(api(), method), e => e.message.includes('desativada'));
  }
});
test('returned data cannot mutate subsequent demo responses', async () => {
  const a = api(); const d = await call(a, 'getPortalData'); d.students[0].id = 'changed';
  assert.equal((await call(a, 'getPortalData')).students[0].id, 'DEMO-001');
});
