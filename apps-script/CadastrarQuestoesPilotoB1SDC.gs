
/**
 * SDC 1.7 — BATERIA PILOTO B1
 * 3 Reading + 2 Use of English
 *
 * Depende de:
 * - cadastrarQuestaoSDC()
 * - listarQuestoesSDC()
 *
 * Não aprova questões automaticamente.
 * Pode ser executado novamente sem duplicar
 * os mesmos enunciados.
 */

function cadastrarQuestoesPilotoB1SDC() {

  const questoes = [

    // QUESTÃO 1 — READING: IDEIA PRINCIPAL
    {
      nivel: 'B1',
      habilidade: 'Reading',
      tema: 'Cultural Exchange',

      contexto:
        'Students from four countries organized a ' +
        'cultural exhibition at an international ' +
        'youth event. At first, they planned to ' +
        'show traditional food, flags and music. ' +
        'However, their teachers encouraged them ' +
        'to include personal experiences. Each ' +
        'group then presented a story about a ' +
        'cultural misunderstanding and explained ' +
        'how it had been resolved. Visitors said ' +
        'that these stories helped them understand ' +
        'daily life in other countries better.',

      enunciado:
        'What was the main change in the exhibition?',

      alternativaA:
        'Students replaced the exhibition with a concert.',

      alternativaB:
        'Students included personal cultural experiences.',

      alternativaC:
        'Teachers removed all traditional cultural elements.',

      alternativaD:
        'Visitors organized the exhibition themselves.',

      gabarito: 'B',

      justificativa:
        'The students added personal stories about ' +
        'cultural misunderstandings and their resolution.',

      dificuldade: 'Media',
      autoria: 'Equipe SDC - Piloto B1'
    },

    // QUESTÃO 2 — READING: INFERÊNCIA
    {
      nivel: 'B1',
      habilidade: 'Reading',
      tema: 'Intercultural Understanding',

      contexto:
        'During an international school project, ' +
        'students noticed that some participants ' +
        'spoke less during online meetings. ' +
        'Instead of assuming that these students ' +
        'were uninterested, the group created ' +
        'a shared document where everyone could ' +
        'contribute ideas before each meeting. ' +
        'Participation improved, and students ' +
        'who had rarely spoken began leading ' +
        'parts of the discussions.',

      enunciado:
        'What can be inferred about the shared document?',

      alternativaA:
        'It offered another way for students to participate.',

      alternativaB:
        'It replaced the need for all future meetings.',

      alternativaC:
        'It was used only by the teachers.',

      alternativaD:
        'It prevented students from speaking during meetings.',

      gabarito: 'A',

      justificativa:
        'The shared document allowed students to ' +
        'prepare and contribute ideas, which ' +
        'supported broader participation.',

      dificuldade: 'Media',
      autoria: 'Equipe SDC - Piloto B1'
    },

    // QUESTÃO 3 — READING: INFORMAÇÃO ESPECÍFICA
    {
      nivel: 'B1',
      habilidade: 'Reading',
      tema: 'Youth Diplomacy',

      contexto:
        'A group of young delegates organized ' +
        'a virtual conference about protecting ' +
        'local rivers. Before the event, each ' +
        'school researched an environmental ' +
        'problem in its community. During the ' +
        'conference, the students compared ' +
        'their findings and agreed to create ' +
        'a digital campaign. The campaign ' +
        'would share practical actions that ' +
        'families could take to reduce water ' +
        'pollution.',

      enunciado:
        'What did the delegates decide to do after comparing their findings?',

      alternativaA:
        'Cancel their environmental projects.',

      alternativaB:
        'Visit every participating school.',

      alternativaC:
        'Create a digital awareness campaign.',

      alternativaD:
        'Send their research only to teachers.',

      gabarito: 'C',

      justificativa:
        'The text explicitly states that the ' +
        'students agreed to create a digital campaign.',

      dificuldade: 'Media',
      autoria: 'Equipe SDC - Piloto B1'
    },

    // QUESTÃO 4 — USE OF ENGLISH: RELATIVE CLAUSES
    {
      nivel: 'B1',
      habilidade: 'Use of English',
      tema: 'International Cooperation',

      contexto:
        'Complete the sentence using the ' +
        'most appropriate relative pronoun.',

      enunciado:
        'The students _____ proposals were selected will present them at the international forum.',

      alternativaA: 'who',
      alternativaB: 'whose',
      alternativaC: 'which',
      alternativaD: 'where',

      gabarito: 'B',

      justificativa:
        '"Whose" expresses possession: ' +
        'the proposals belong to the students.',

      dificuldade: 'Media',
      autoria: 'Equipe SDC - Piloto B1'
    },

    // QUESTÃO 5 — USE OF ENGLISH: COLLOCATION
    {
      nivel: 'B1',
      habilidade: 'Use of English',
      tema: 'Diplomatic Communication',

      contexto:
        'Choose the verb that best completes ' +
        'the sentence in a diplomatic context.',

      enunciado:
        'After listening to both sides, the teams finally _____ an agreement.',

      alternativaA: 'did',
      alternativaB: 'reached',
      alternativaC: 'took',
      alternativaD: 'held',

      gabarito: 'B',

      justificativa:
        '"Reach an agreement" is the appropriate ' +
        'English collocation for coming to an agreement.',

      dificuldade: 'Media',
      autoria: 'Equipe SDC - Piloto B1'
    }

  ];

  const normalizar = texto =>
    String(texto || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  const existentes = listarQuestoesSDC({
    nivel: 'B1'
  });

  const enunciados = new Set(
    existentes.map(q => normalizar(q.enunciado))
  );

  const resultado = {
    cadastradas: [],
    ignoradas: [],
    erros: []
  };

  questoes.forEach((questao, indice) => {

    const chave = normalizar(questao.enunciado);

    if (enunciados.has(chave)) {
      resultado.ignoradas.push(indice + 1);
      return;
    }

    try {
      const cadastro = cadastrarQuestaoSDC(questao);

      resultado.cadastradas.push(cadastro.id);
      enunciados.add(chave);

    } catch (erro) {
      resultado.erros.push({
        questao: indice + 1,
        mensagem: erro.message
      });
    }

  });

  console.log(JSON.stringify(resultado));

  return resultado;
}


