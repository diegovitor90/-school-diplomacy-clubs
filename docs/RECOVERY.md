# Recuperação da versão institucional

## Importado

`src/Portal.html` foi extraído do arquivo de texto da interface fornecido pelo responsável. A identidade da origem e seu SHA-256 estão em `source-inventory.json`. Foram normalizadas quebras de linha e substituído o endereço institucional do piloto por configuração. A interface original em produção não foi alterada.

## Ainda necessário

Exportar o projeto **da implantação 2.2 em uso**, incluindo todos os arquivos `.gs`, HTML auxiliares e `appsscript.json`. O link terminado em `/exec` não fornece o código-fonte. No editor Apps Script, conferir a versão da implantação e obter os arquivos correspondentes; não presumir que o código atual do editor seja idêntico à versão publicada.

As chamadas esperadas estão em [API_CONTRACT.md](API_CONTRACT.md). Também faltam os módulos completos de sincronização, sugestões, auditoria, geradores, piloto e configuração, além do código do formulário escolar se ele entrar no escopo.

Não exportar linhas de estudantes, PDFs de termos, tokens, credenciais ou a configuração privada junto do código de portfólio.

## Pontos técnicos para revisar na importação

1. **Paginação da sincronização:** o trecho reinicia a varredura e conta arquivos já conhecidos no limite de 400. Acima desse limite, arquivos posteriores podem nunca ser processados. Usar continuidade persistida e testar mais de um lote.
2. **Assinaturas fora da triagem:** registros vinculados automaticamente por ID podem não aparecer na tela que lista apenas triagens aprovadas. Garantir cobertura de ambos os caminhos.
3. **Sugestões após decisão:** a rotina preserva revisão e observação, mas recalcula ID e nome. Uma decisão anterior não deve ficar associada silenciosamente a uma nova sugestão.
4. **Estados sobrepostos:** contabilizar o mesmo ID em múltiplos estados pode distorcer totais; definir regra por estudante e tratar duplicidades como inconsistência.
5. **Falhas parciais:** gravação no registro, atualização da triagem e auditoria são operações separadas. Testar interrupções e recuperação idempotente.
6. **Formato copiado:** os trechos colados contêm escapes de formatação e uma função de planos duplicada. Importar arquivos reais, sem substituir a produção por texto decodificado automaticamente.
7. **Links de arquivos:** escapar HTML não valida o protocolo de uma URL. Aplicar validação de destino antes de renderizar links vindos da base.
8. **Identidade:** conferir o comportamento da conta ativa e a restrição de acesso na implantação real; interface oculta não equivale a controle de acesso.

Estes são achados de leitura dos trechos, não falhas reproduzidas na implantação atual.

## Critério para considerar o código completo

- Todas as funções usadas pela interface têm implementação e configuração documentadas.
- A base de homologação usa somente exemplos fictícios.
- Leitura sem autorização, concorrência, duplicidade e repetição de decisões foram testadas.
- Conferência atende documentos recebidos por todos os caminhos.
- Relatórios e planos são gerados e registrados corretamente em homologação.
- Backup e procedimento de retorno à versão anterior estão definidos.
- Uma nova implantação de teste reproduz o comportamento esperado sem alterar a produção.

## Publicação no GitHub

Nome proposto: `school-diplomacy-clubs`.

Descrição: `Portal de gestão educacional para School Diplomacy Clubs: acompanhamento de estudantes, documentação e apoio pedagógico com Google Apps Script.`

Tópicos sugeridos: `google-apps-script`, `education`, `javascript`, `google-sheets`, `edtech`, `school-diplomacy`.

O pacote atual contém uma demonstração publicável sem dados reais. A licença e a autorização sobre o código institucional precisam ser definidas antes de tratá-lo como software livre. Criar inicialmente um repositório privado permite revisar esse ponto e completar a importação.
