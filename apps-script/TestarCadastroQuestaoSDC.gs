
function testarCadastroQuestaoSDC() {

  const enunciado =
    'What is the main purpose of the exchange?';

  const existentes = listarQuestoesSDC({
    nivel: 'B1'
  });

  if (existentes.some(q => q.enunciado === enunciado)) {
    console.log('Questão de teste já cadastrada.');
    return;
  }

  const resultado = cadastrarQuestaoSDC({
    nivel: 'B1',
    habilidade: 'Reading',
    tema: 'Cultural Exchange',

    contexto:
      'Students from Brazil and Russia participate ' +
      'in an online exchange. They share traditions, ' +
      'discuss cultural differences and work together ' +
      'on a project about the environment.',

    enunciado: enunciado,

    alternativaA:
      'To compete against students from other countries.',

    alternativaB:
      'To exchange cultural experiences and collaborate.',

    alternativaC:
      'To study only environmental problems.',

    alternativaD:
      'To organize an international sports event.',

    gabarito: 'B',

    justificativa:
      'The exchange promotes cultural understanding ' +
      'and collaborative activities.',

    dificuldade: 'Media',
    autoria: 'Equipe SDC - Questão piloto'
  });

  console.log(JSON.stringify(resultado));
}
