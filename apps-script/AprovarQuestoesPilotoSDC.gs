
/**
 * PORTAL SDC 1.7
 * APROVAÇÃO PEDAGÓGICA — PILOTO B1
 *
 * Aprova somente SDC-Q0002 até SDC-Q0006.
 * Reutiliza a função de curadoria existente.
 * Registra cada decisão na auditoria.
 * Não modifica a questão SDC-Q0001.
 */

function aprovarQuestoesPilotoB1SDC() {

  sdcRevisor_();

  const questoes = [
    {
      id: 'SDC-Q0002',
      habilidade: 'Reading',
      gabarito: 'B'
    },
    {
      id: 'SDC-Q0003',
      habilidade: 'Reading',
      gabarito: 'A'
    },
    {
      id: 'SDC-Q0004',
      habilidade: 'Reading',
      gabarito: 'C'
    },
    {
      id: 'SDC-Q0005',
      habilidade: 'Use of English',
      gabarito: 'B'
    },
    {
      id: 'SDC-Q0006',
      habilidade: 'Use of English',
      gabarito: 'B'
    }
  ];

  const aprovadas = [];
  const jaAprovadas = [];
  const pendentes = [];

  // Confere todos os itens antes de começar.
  questoes.forEach(item => {

    const q = consultarQuestaoCuradoriaSDC(item.id);

    if (
      q.nivel !== 'B1' ||
      q.habilidade !== item.habilidade ||
      q.gabarito !== item.gabarito
    ) {
      throw new Error(
        'Dados divergentes na questão ' + item.id
      );
    }

    if (q.status === 'Aprovada') {
      jaAprovadas.push(item.id);

    } else if (q.status === 'Em revisao') {
      pendentes.push(item.id);

    } else {
      throw new Error(
        'Status inesperado em ' + item.id +
        ': ' + q.status
      );
    }

  });

  // Executa as aprovações individualmente,
  // preservando a auditoria de cada questão.
  pendentes.forEach(id => {

    const justificativa =
      'Revisão pedagógica humana concluída pela ' +
      'coordenação. Enunciado, alternativas, ' +
      'gabarito e adequação proposta ao nível ' +
      'B1 foram conferidos e aprovados ' +
      'para utilização na avaliação piloto.';

    const resultado = decidirCuradoriaQuestaoSDC(
      id,
      'APROVAR',
      justificativa
    );

    if (resultado.statusNovo !== 'Aprovada') {
      throw new Error(
        'Falha ao aprovar a questão ' + id
      );
    }

    aprovadas.push(id);

  });

  const resultado = {
    sucesso: true,
    aprovadasAgora: aprovadas,
    jaAprovadas: jaAprovadas,
    totalAprovadasNoLote:
      aprovadas.length + jaAprovadas.length
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

/**
 * CONFIRMAÇÃO FINAL
 * Apenas consulta os cinco itens.
 */
function verificarAprovacoesB1SDC() {

  const ids = [
    'SDC-Q0002',
    'SDC-Q0003',
    'SDC-Q0004',
    'SDC-Q0005',
    'SDC-Q0006'
  ];

  const questoes = ids.map(id =>
    consultarQuestaoCuradoriaSDC(id)
  );

  const resultado = {
    sucesso: questoes.every(
      q => q.status === 'Aprovada'
    ),
    totalAprovadas: questoes.filter(
      q => q.status === 'Aprovada'
    ).length,
    detalhes: questoes.map(q => ({
      id: q.id,
      nivel: q.nivel,
      status: q.status
    }))
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}
