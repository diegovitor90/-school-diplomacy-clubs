
/**
 * PORTAL SDC 1.8
 * APLICAÇÃO SIMULADA E CORREÇÃO AUTOMÁTICA
 *
 * Usa questões aprovadas do banco.
 * Não utiliza dados de estudantes reais.
 * Não altera a aba RESPOSTAS_SDC.
 */

const SDC_AV_TESTE_ID = 'SDC-TESTE-B1-001';
const SDC_AV_ALUNO_TESTE = 'ALUNO-FICTICIO-001';

function executarAvaliacaoSimuladaSDC() {
  const revisor = sdcRevisor_();

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(15000)) {
    throw new Error('Outra operação está em andamento.');
  }

  try {
    const ss = sdcDados_();
    const banco = ss.getSheetByName('QUESTOES_SDC');

    if (!banco) {
      throw new Error('Banco de questões não encontrado.');
    }

    const ids = [
      'SDC-Q0002',
      'SDC-Q0003',
      'SDC-Q0004',
      'SDC-Q0005',
      'SDC-Q0006'
    ];

    // Respostas fictícias para testar a correção.
    // A última está incorreta intencionalmente.
    const respostasFicticias = {
      'SDC-Q0002': 'B',
      'SDC-Q0003': 'A',
      'SDC-Q0004': 'C',
      'SDC-Q0005': 'B',
      'SDC-Q0006': 'A'
    };

    const linhas = banco.getDataRange()
      .getDisplayValues().slice(1);

    const questoes = ids.map(id => {
      const encontradas = linhas.filter(
        r => String(r[0]).trim() === id
      );

      if (encontradas.length !== 1) {
        throw new Error(
          'Questão ausente ou duplicada: ' + id
        );
      }

      const q = encontradas[0];

      if (
        q[1] !== 'B1' ||
        q[13] !== 'Aprovada' ||
        !['A', 'B', 'C', 'D'].includes(q[10])
      ) {
        throw new Error(
          'Questão não está apta: ' + id
        );
      }

      return {
        id: id,
        gabarito: q[10],
        resposta: respostasFicticias[id]
      };
    });

    // Abas exclusivas de homologação.
    const abaRespostas = prepararAbaTesteSDC_(
      ss,
      'RESPOSTAS_TESTE_SDC',
      [
        'ID tentativa',
        'ID estudante',
        'ID questao',
        'Resposta',
        'Correta',
        'Data e hora',
        'Observacao'
      ]
    );

    const abaTentativas = prepararAbaTesteSDC_(
      ss,
      'TENTATIVAS_TESTE_SDC',
      [
        'ID tentativa',
        'ID estudante',
        'Nivel',
        'Total',
        'Acertos',
        'Percentual',
        'Revisor',
        'Data e hora',
        'Observacao'
      ]
    );

    // Evita duplicar a mesma tentativa.
    const anteriores = abaRespostas.getDataRange()
      .getDisplayValues().slice(1)
      .filter(r => r[0] === SDC_AV_TESTE_ID);

    const tentativas = abaTentativas.getDataRange()
      .getDisplayValues().slice(1)
      .filter(r => r[0] === SDC_AV_TESTE_ID);

    if (anteriores.length || tentativas.length) {
      if (
        anteriores.length !== 5 ||
        tentativas.length !== 1
      ) {
        throw new Error(
          'Registro parcial encontrado. Confira as abas de teste.'
        );
      }

      console.log('Teste já registrado. Sem duplicações.');
      return verificarAvaliacaoSimuladaSDC();
    }

    // Correção realizada no servidor.
    const corrigidas = questoes.map(q => ({
      id: q.id,
      resposta: q.resposta,
      correta: q.resposta === q.gabarito
    }));

    const acertos = corrigidas.filter(
      q => q.correta
    ).length;

    const percentual = Math.round(
      (acertos / corrigidas.length) * 100
    );

    const agora = new Date();

    // Registra cada resposta em aba de teste.
    const registros = corrigidas.map(q => [
      SDC_AV_TESTE_ID,
      SDC_AV_ALUNO_TESTE,
      q.id,
      q.resposta,
      q.correta,
      agora,
      'SIMULAÇÃO — SEM ESTUDANTE REAL'
    ]);

    abaRespostas.getRange(
      abaRespostas.getLastRow() + 1,
      1,
      registros.length,
      7
    ).setValues(registros);

    // Registra o resultado consolidado.
    abaTentativas.appendRow([
      SDC_AV_TESTE_ID,
      SDC_AV_ALUNO_TESTE,
      'B1',
      corrigidas.length,
      acertos,
      percentual,
      revisor,
      agora,
      'Piloto técnico. Não representa certificação CEFR.'
    ]);

    SpreadsheetApp.flush();

    const resultado = {
      sucesso: true,
      estudante: SDC_AV_ALUNO_TESTE,
      totalQuestoes: corrigidas.length,
      acertos: acertos,
      erros: corrigidas.length - acertos,
      percentual: percentual,
      classificacaoCEFR: 'Não atribuída',
      ambiente: 'TESTE'
    };

    console.log(JSON.stringify(resultado));
    return resultado;

  } finally {
    lock.releaseLock();
  }
}

/**
 * Cria ou confere uma aba de homologação.
 */
function prepararAbaTesteSDC_(ss, nome, cabecalhos) {
  let aba = ss.getSheetByName(nome);

  if (!aba) {
    aba = ss.insertSheet(nome);

    aba.getRange(1, 1, 1, cabecalhos.length)
      .setValues([cabecalhos]);

    aba.setFrozenRows(1);

    aba.getRange(1, 1, 1, cabecalhos.length)
      .setFontWeight('bold')
      .setBackground('#e8efff');

  } else {
    const atual = aba.getRange(
      1, 1, 1, cabecalhos.length
    ).getDisplayValues()[0];

    if (atual.join('|') !== cabecalhos.join('|')) {
      throw new Error(
        'Cabeçalhos incompatíveis na aba ' + nome
      );
    }
  }

  return aba;
}

/**
 * Verifica se a correção foi registrada.
 */
function verificarAvaliacaoSimuladaSDC() {
  sdcRevisor_();

  const ss = sdcDados_();

  const abaR = ss.getSheetByName(
    'RESPOSTAS_TESTE_SDC'
  );

  const abaT = ss.getSheetByName(
    'TENTATIVAS_TESTE_SDC'
  );

  if (!abaR || !abaT) {
    throw new Error(
      'Execute a simulação antes da verificação.'
    );
  }

  const respostas = abaR.getDataRange()
    .getValues().slice(1)
    .filter(r => r[0] === SDC_AV_TESTE_ID);

  const tentativas = abaT.getDataRange()
    .getValues().slice(1)
    .filter(r => r[0] === SDC_AV_TESTE_ID);

  const acertos = respostas.filter(
    r => r[4] === true
  ).length;

  // Verifica se o ID fictício foi lançado
  // indevidamente na aba de produção.
  const producao = ss.getSheetByName('RESPOSTAS_SDC');

  const registroIndevido = producao
    ? producao.getDataRange().getDisplayValues()
      .slice(1)
      .some(r => r[1] === SDC_AV_ALUNO_TESTE)
    : false;

  const aprovado =
    respostas.length === 5 &&
    tentativas.length === 1 &&
    acertos === 4 &&
    Number(tentativas[0][4]) === 4 &&
    Number(tentativas[0][5]) === 80 &&
    !registroIndevido;

  const resultado = {
    testeAprovado: aprovado,
    respostasRegistradas: respostas.length,
    acertos: acertos,
    percentual: respostas.length
      ? Math.round(acertos / respostas.length * 100)
      : 0,
    tentativasRegistradas: tentativas.length,
    alunoFicticioNaBaseDeProducao: registroIndevido
  };

  console.log(JSON.stringify(resultado));
  return resultado;
}

