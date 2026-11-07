# Validação da importação

Verificação local em 07/11/2026: **9 testes aprovados**, geração da demonstração e verificações estáticas aprovadas.

- Os 20 arquivos GS (19 originais + configuração) compilam no mesmo contexto.
- Conta ausente, não autorizada e lista vazia negam acesso; lista configurada é normalizada.
- Dashboard conta assinatura válida, exclui inativos e não retorna nome do estudante.
- Payload do piloto exclui gabarito; decisões inválidas são rejeitadas antes de gravação.
- Três testes da demonstração verificam consistência, bloqueio de escrita e isolamento de dados.
- HTMLs ativos e históricos passam na análise sintática de scripts inline.
- Identificadores institucionais conhecidos não estão nos arquivos importados; manifesto mantém MYSELF.

Os testes usam mocks, sem chamadas ao Google. Não comprovam permissões reais, identidade de sessão, processamento de PDFs, concorrência ou gravação em Sheets/Docs. A validação integrada e visual continua pendente. Consulte SETUP.md e RECOVERY.md.

O workflow do GitHub executa geração, verificações e testes a cada push/PR; seu resultado deve ser consultado na aba Actions do commit correspondente.
