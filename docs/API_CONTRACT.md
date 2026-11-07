# Contrato observado na interface

Este inventário descreve o cliente recuperado. As implementações estão incluídas em `apps-script/`; testes locais cobrem contratos selecionados, sem integração com Google Workspace.

| Função | Entrada do cliente | Resposta usada |
| --- | --- | --- |
| `getPortalData` | nenhuma | `kpis`, `cefr`, `escolas`, `students` |
| `getTriagemPortalSDC` | nenhuma | lista com arquivo, URL, pasta, sugestão, resultado e revisão |
| `decidirTriagemPortalSDC` | arquivoId, APROVAR/REJEITAR, motivo | `estado` |
| `listarAssinaturasSDC` | nenhuma | lista com arquivoId, id, arquivo, url, estudante, situacao, assinatura, elegivel |
| `decidirAssinaturaSDC` | arquivoId, VALIDAR/CORRECAO, justificativa | `situacao` |
| `obterAdministrativoSDC` | nenhuma | email, competencia, relatorios, planos |
| `gerarRelatorioGestaoSDC` | atividades, dificuldades, encaminhamentos | `url` |
| `gerarPlanoGestaoSDC` | tema, nivel, duracao, objetivo, professor, publico | `url` |

`kpis` contém escolas, estudantes, confirmados, recebidos, validados, pendentes e correcao. `students` contém id como string, escola, cefr, situacao e conferencia. Históricos administrativos contêm data, titulo e link.

A duração chega do formulário como string e precisa ser validada/converter no servidor. Validações HTML são auxiliares e não substituem verificações do backend.

Trechos antigos de `gerarRelatorioMensalSDC` e `gerarPlanoDeAulaSDC` não substituem automaticamente os métodos `gerarRelatorioGestaoSDC` e `gerarPlanoGestaoSDC` chamados pela interface 2.2.
