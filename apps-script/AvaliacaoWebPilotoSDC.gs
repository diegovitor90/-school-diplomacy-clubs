
/**
 * SDC 1.8 — AVALIAÇÃO WEB PILOTO
 * Somente para equipe autorizada.
 * Utiliza identidade fictícia.
 *
 * Dependências já existentes:
 * sdcRevisor_()
 * sdcDados_()
 * obterQuestoesAprovadasSDC()
 * prepararAbaTesteSDC_()
 */

const SDC_WEB_PILOTO_ID = 'SDC-WEB-PILOTO-20261025';
const SDC_WEB_ALUNO_ID = 'ALUNO-FICTICIO-WEB';

const SDC_WEB_QUESTOES = [
  'SDC-Q0002',
  'SDC-Q0003',
  'SDC-Q0004',
  'SDC-Q0005',
  'SDC-Q0006'
];

function sdcQuestoesWebInternas_() {
  sdcRevisor_();

  const aprovadas = obterQuestoesAprovadasSDC(
    'B1',
    ['Reading', 'Use of English']
  );

  return SDC_WEB_QUESTOES.map(id => {
    const encontradas = aprovadas.filter(q => q.id === id);

    if (encontradas.length !== 1) {
      throw new Error(
        'Questão não aprovada ou duplicada: ' + id
      );
    }

    return encontradas[0];
  });
}

function obterAvaliacaoWebSDC() {
  const questoes = sdcQuestoesWebInternas_();

  return {
    titulo: 'SDC English Diagnostic — Piloto técnico',
    nivel: 'B1',
    questoes: questoes.map(q => ({
      id: q.id,
      habilidade: q.habilidade,
      contexto: q.contexto,
      enunciado: q.enunciado,
      alternativas: q.alternativas
    }))
  };
}

function enviarAvaliacaoWebSDC(respostas) {
  sdcRevisor_();

  if (
    !respostas ||
    typeof respostas !== 'object' ||
    Array.isArray(respostas)
  ) {
    throw new Error('Respostas inválidas.');
  }

  const chaves = Object.keys(respostas);

  if (
    chaves.length !== 5 ||
    chaves.some(id => !SDC_WEB_QUESTOES.includes(id))
  ) {
    throw new Error('Responda às cinco questões.');
  }

  const lock = LockService.getScriptLock();

  if (!lock.tryLock(15000)) {
    throw new Error('Outra avaliação em andamento.');
  }

  try {
    const ss = sdcDados_();
    const questoes = sdcQuestoesWebInternas_();

    const corrigidas = questoes.map(q => {
      const resposta = String(respostas[q.id] || '')
        .trim().toUpperCase();

      if (!['A', 'B', 'C', 'D'].includes(resposta)) {
        throw new Error('Resposta inválida: ' + q.id);
      }

      return {
        id: q.id,
        resposta: resposta,
        correta: resposta === q.gabarito
      };
    });

    const abaR = prepararAbaTesteSDC_(
      ss,
      'RESPOSTAS_TESTE_SDC',
      [
        'ID tentativa', 'ID estudante',
        'ID questao', 'Resposta', 'Correta',
        'Data e hora', 'Observacao'
      ]
    );

    const abaT = prepararAbaTesteSDC_(
      ss,
      'TENTATIVAS_TESTE_SDC',
      [
        'ID tentativa', 'ID estudante', 'Nivel',
        'Total', 'Acertos', 'Percentual',
        'Revisor', 'Data e hora', 'Observacao'
      ]
    );

    const existeTentativa = abaT.getDataRange()
      .getDisplayValues().slice(1)
      .some(r => r[0] === SDC_WEB_PILOTO_ID);

    const existemRespostas = abaR.getDataRange()
      .getDisplayValues().slice(1)
      .some(r => r[0] === SDC_WEB_PILOTO_ID);

    if (existeTentativa || existemRespostas) {
      throw new Error(
        'Este piloto web já foi respondido.'
      );
    }

    const agora = new Date();

    const acertos = corrigidas.filter(
      q => q.correta
    ).length;

    const percentual = acertos * 20;

    const linhas = corrigidas.map(q => [
      SDC_WEB_PILOTO_ID,
      SDC_WEB_ALUNO_ID,
      q.id,
      q.resposta,
      q.correta,
      agora,
      'PILOTO WEB — IDENTIDADE FICTÍCIA'
    ]);

    abaR.getRange(
      abaR.getLastRow() + 1,
      1,
      linhas.length,
      7
    ).setValues(linhas);

    abaT.appendRow([
      SDC_WEB_PILOTO_ID,
      SDC_WEB_ALUNO_ID,
      'B1',
      5,
      acertos,
      percentual,
      sdcRevisor_(),
      agora,
      'PILOTO WEB — sem classificação CEFR'
    ]);

    SpreadsheetApp.flush();

    return {
      sucesso: true,
      total: 5,
      acertos: acertos,
      percentual: percentual,
      aviso: 'Pontuação técnica, não certificação CEFR.'
    };

  } finally {
    lock.releaseLock();
  }
}

function paginaPilotoSDC_() {
  sdcRevisor_();

  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<base target="_top">
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width,initial-scale=1">

<title>SDC — Avaliação piloto</title>

<style>
* {box-sizing:border-box}

body {
  margin:0;
  background:#f3f6fc;
  color:#1b2b48;
  font:15px Arial,sans-serif;
}

header {
  background:white;
  padding:20px;
  border-bottom:1px solid #e1e7f1;
}

main {
  max-width:760px;
  margin:20px auto;
  padding:0 15px 50px;
}

h1 {font-size:22px}
h2 {font-size:17px}

.card {
  background:white;
  border:1px solid #e2e9f3;
  border-radius:15px;
  padding:20px;
  margin:15px 0;
}

.contexto {
  background:#f5f8fc;
  padding:12px;
  border-radius:9px;
  line-height:1.6;
}

.opcao {
  display:flex;
  gap:12px;
  padding:13px;
  border:1px solid #e0e7f1;
  border-radius:10px;
  margin:9px 0;
}

button {
  border:0;
  background:#2869db;
  color:white;
  font-weight:bold;
  padding:15px;
  border-radius:10px;
  width:100%;
}

button:disabled {opacity:.5}

#estado {
  margin-top:16px;
  padding:12px;
}
</style>
</head>

<body>
<header>
  <h1>◈ SDC Portal</h1>
  <p>English Diagnostic — Demonstração</p>
</header>

<main>
  <div class="card">
    <h2>Teste piloto B1</h2>
    <p>5 questões · Reading e Use of English</p>
    <p>Identificação: estudante fictício</p>
    <p>Uso exclusivo da equipe autorizada.</p>
  </div>

  <form id="prova" hidden>
    <div id="questoes"></div>
    <button id="enviar" type="submit">
      Enviar respostas
    </button>
  </form>

  <div id="estado" aria-live="polite">
    Carregando avaliação...
  </div>
</main>

<script>
var avaliacao = null;
var estado = document.getElementById('estado');

function mostrarMensagem(texto) {
  estado.textContent = texto;
}

function mostrarQuestoes(dados) {
  avaliacao = dados;

  var area = document.getElementById('questoes');
  area.replaceChildren();

  dados.questoes.forEach(function(q, indice) {
    var bloco = document.createElement('section');
    bloco.className = 'card';

    var titulo = document.createElement('h2');
    titulo.textContent =
      'Questão ' + (indice + 1) +
      ' — ' + q.habilidade;

    bloco.appendChild(titulo);

    if (q.contexto) {
      var contexto = document.createElement('p');
      contexto.className = 'contexto';
      contexto.textContent = q.contexto;
      bloco.appendChild(contexto);
    }

    var enunciado = document.createElement('p');
    enunciado.textContent = q.enunciado;
    bloco.appendChild(enunciado);

    ['A','B','C','D'].forEach(function(letra, i) {
      var opcao = document.createElement('label');
      opcao.className = 'opcao';

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'questao_' + indice;
      input.value = letra;

      var texto = document.createElement('span');
      texto.textContent =
        letra + ') ' + q.alternativas[i];

      opcao.append(input, texto);
      bloco.appendChild(opcao);
    });

    area.appendChild(bloco);
  });

  document.getElementById('prova').hidden = false;
  mostrarMensagem('');
}

document.getElementById('prova')
  .addEventListener('submit', function(event) {
    event.preventDefault();

    var respostas = {};

    for (var i = 0; i < avaliacao.questoes.length; i++) {
      var marcada = document.querySelector(
        'input[name="questao_' + i + '"]:checked'
      );

      if (!marcada) {
        mostrarMensagem(
          'Responda à questão ' + (i + 1)
        );
        return;
      }

      respostas[avaliacao.questoes[i].id] =
        marcada.value;
    }

    var botao = document.getElementById('enviar');
    botao.disabled = true;

    mostrarMensagem('Corrigindo respostas...');

    google.script.run
      .withSuccessHandler(function(resultado) {
        mostrarMensagem(
          'Resultado: ' +
          resultado.acertos + '/' +
          resultado.total + ' acertos (' +
          resultado.percentual + '%). ' +
          resultado.aviso
        );

        document.getElementById('prova').hidden = true;
      })
      .withFailureHandler(function(erro) {
        botao.disabled = false;
        mostrarMensagem('Erro: ' + erro.message);
      })
      .enviarAvaliacaoWebSDC(respostas);
  });

google.script.run
  .withSuccessHandler(mostrarQuestoes)
  .withFailureHandler(function(erro) {
    mostrarMensagem('Erro: ' + erro.message);
  })
  .obterAvaliacaoWebSDC();
<\/script>
</body>
</html>
  `).setTitle('SDC — Avaliação piloto');
}

