
/**
 * SDC 1.7 — AJUSTES PEDAGÓGICOS DO PILOTO B1
 * Altera apenas Q0004 e Q0006.
 * Preserva IDs, gabaritos e status Em revisao.
 * Registra as alterações na auditoria.
 */

function revisarQuestoesPilotoSDC() {
  const revisor = sdcRevisor_();
  const ss = sdcDados_();
  const aba = ss.getSheetByName('QUESTOES_SDC');
  const auditoria = configurarCuradoriaSDC();

  if (!aba) throw new Error('Banco não encontrado.');

  const ajustes = [
    {
      id: 'SDC-Q0004',
      anterior:
        'What did the delegates decide to do after comparing their findings?',
      enunciado:
        "What was the main purpose of the delegates' follow-up action?",
      alternativas: [
        'To gather more evidence before presenting conclusions.',
        'To compare how each school conducted its research.',
        'To encourage families to act on the environmental findings.',
        'To organize another conference with the same delegates.'
      ],
      gabarito: 'C',
      justificativa:
        'The campaign aims to turn research findings into practical actions that families can take.'
    },
    {
      id: 'SDC-Q0006',
      anterior:
        'After listening to both sides, the teams finally _____ an agreement.',
      contexto:
        'Although the delegations initially disagreed, they continued negotiating and eventually agreed on a joint proposal.',
      enunciado:
        'Despite their differences, the delegations succeeded _____ reaching an agreement.',
      alternativas: [
        'on',
        'in',
        'at',
        'for'
      ],
      gabarito: 'B',
      justificativa:
        'The correct structure is "succeed in + verb-ing".'
    }
  ];

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(15000)) {
    throw new Error('Outra operação está em andamento.');
  }

  try {
    const linhas = aba.getDataRange().getValues();
    const plano = [];

    // Confere todos os itens antes de modificar.
    ajustes.forEach(q => {
      const indice = linhas.findIndex(
        (r, i) => i > 0 && String(r[0]).trim() === q.id
      );

      if (indice < 1) {
        throw new Error('Questão não encontrada: ' + q.id);
      }

      const atual = linhas[indice];

      if (String(atual[13]).trim() !== 'Em revisao') {
        throw new Error(q.id + ' não está em revisão.');
      }

      if (String(atual[5]) === q.enunciado) {
        return; // Item já atualizado.
      }

      if (String(atual[5]) !== q.anterior) {
        throw new Error(
          q.id + ' foi alterada anteriormente. Revisar manualmente.'
        );
      }

      plano.push({ indice, atual, questao: q });
    });

    const atualizadas = [];

    plano.forEach(item => {
      const q = item.questao;
      const dados = item.atual.slice(4, 12);

      if (q.contexto) dados[0] = q.contexto;

      dados[1] = q.enunciado;
      q.alternativas.forEach((alt, i) => {
        dados[i + 2] = alt;
      });

      dados[6] = q.gabarito;
      dados[7] = q.justificativa;

      // Atualiza E:L, sem alterar ID ou status.
      aba.getRange(item.indice + 1, 5, 1, 8)
        .setValues([dados]);

      aba.getRange(item.indice + 1, 17)
        .setValue(new Date());

      auditoria.appendRow([
        new Date(),
        revisor,
        q.id,
        'AJUSTAR_ITEM',
        'Em revisao',
        'Em revisao',
        'Revisão pedagógica. Enunciado anterior: ' +
          q.anterior + ' | Novo enunciado: ' + q.enunciado
      ]);

      atualizadas.push(q.id);
    });

    SpreadsheetApp.flush();

    const resultado = {
      sucesso: true,
      questoesAtualizadas: atualizadas,
      status: 'Em revisao',
      aprovacaoAutomatica: false
    };

    console.log(JSON.stringify(resultado));
    return resultado;

  } finally {
    lock.releaseLock();
  }
}

function conferirAjustesPilotoSDC() {
  const ids = ['SDC-Q0004', 'SDC-Q0006'];

  const resultado = ids.map(id => {
    const q = consultarQuestaoCuradoriaSDC(id);

    return {
      id: q.id,
      enunciado: q.enunciado,
      gabarito: q.gabarito,
      status: q.status
    };
  });

  console.log(JSON.stringify(resultado));
  return resultado;
}
