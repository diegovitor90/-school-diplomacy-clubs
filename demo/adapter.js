/* Local, synthetic data. No network, persistence, or production credentials. */
(function () {
  const schools = ['Escola Horizonte (demo)', 'Escola Aurora (demo)', 'Escola Farol (demo)'];
  const statuses = ['Validado', 'Recebido — aguardando conferência', 'Pendente', 'Correção necessária'];
  const students = Array.from({ length: 24 }, (_, i) => ({
    id: 'DEMO-' + String(i + 1).padStart(3, '0'), escola: schools[i % 3],
    cefr: ['A1', 'A2', 'B1', 'B2'][i % 4], situacao: statuses[i % 4],
    conferencia: ['Assinatura válida', 'Não conferida', 'Não recebida', 'Revisar assinatura'][i % 4]
  }));
  const data = {
    kpis: { escolas: 3, estudantes: 24, confirmados: 24, validados: 6, recebidos: 6, pendentes: 6, correcao: 6 },
    cefr: { A1: 6, A2: 6, B1: 6, B2: 6 }, escolas: schools, students
  };
  const fixtures = {
    getPortalData: data,
    getTriagemPortalSDC: [{ arquivoId: 'DEMO-FILE', arquivo: 'Exemplo ilustrativo — sem PDF', url: '#demo-note', pasta: schools[0], idSugerido: 'DEMO-001', estudante: 'Participante fictício 001', resultado: 'Vínculo ilustrativo já revisado', revisao: 'APROVADO', observacao: 'Demonstração' }],
    listarAssinaturasSDC: [{ arquivoId: 'DEMO-FILE', arquivo: 'Exemplo ilustrativo — sem PDF', url: '#demo-note', id: 'DEMO-001', estudante: 'Participante fictício 001', situacao: 'Validado', assinatura: 'Assinatura válida (simulação)', elegivel: false }]
  };
  function runner(success, failure) {
    return new Proxy({}, { get(_, method) {
      if (method === 'withSuccessHandler') return fn => runner(fn, failure);
      if (method === 'withFailureHandler') return fn => runner(success, fn);
      return () => queueMicrotask(() => {
        if (Object.hasOwn(fixtures, method)) { if (success) success(structuredClone(fixtures[method])); }
        else if (failure) failure({ message: 'Demonstração local: esta operação exige o servidor institucional e está desativada.' });
      });
    }});
  }
  window.google = { script: { get run() { return runner(); } } };
})();
