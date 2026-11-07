# Configuração de uma cópia de teste

1. Crie um projeto Apps Script separado e copie apenas os arquivos de `apps-script/`, mantendo os nomes. Não copie `archive/`, `src/` ou `demo/`.
2. Em Configurações do projeto → Propriedades do script, adicione:

| Propriedade | Valor |
| --- | --- |
| SDC_SPREADSHEET_ID | ID da planilha de homologação |
| SDC_DOCUMENTS_FOLDER_ID | ID da pasta restrita de documentos fictícios |
| SDC_REVIEWER_EMAILS | Contas autorizadas, separadas por vírgulas |

A lista vazia bloqueia revisão e administração. IDs vazios impedem operações de dados; o pacote não provisiona nem procura bases institucionais automaticamente.

3. Prepare abas de teste com a mesma estrutura da base. Os módulos legados usam posições de colunas; não basta ter nomes semelhantes. No mínimo:

| Aba | Colunas iniciais, na ordem |
| --- | --- |
| ALUNOS_BASE | ID, Escola, Nome, Permanece 2026-2027?, Nível CEFR |
| ESCOLAS | Escola |
| REGISTRO_DOCUMENTOS | ID do estudante, Situação documental, URL, Conferência da assinatura, Data, Observação |
| TRIAGEM_DRIVE | ID arquivo Drive, Arquivo, URL, Pasta, Motivo, Data da identificação, ID sugerido, Estudante sugerido, Resultado da análise, Revisão humana, Observação da triagem |

Módulos de banco de questões, curadoria e avaliações possuem rotinas próprias de configuração. Leia os cabeçalhos esperados nesses módulos antes de executá-los. Funções de teste, cadastro e aprovação podem escrever dados: execute somente na cópia de homologação. O piloto web utiliza identidade fictícia e não é um fluxo de avaliação para estudantes reais.

4. O manifesto preserva fuso America/Sao_Paulo, runtime V8, execução USER_DEPLOYING e acesso MYSELF. Teste primeiro como proprietário; qualquer ampliação de acesso exige revisão das permissões e da identificação da sessão.
5. O Index é avaliado como template e recebe a URL do piloto da implantação atual. Não é necessário inserir uma URL institucional no HTML.
6. Só habilite o acionador de sincronização após teste manual e revisão do limite de 400 arquivos descrito em RECOVERY.md.

## Verificação local

Node.js 22+, sem dependências npm: `npm run build:demo`, `npm run check` e `npm test`. Esses comandos não acessam Google Drive, Sheets ou Docs. Para portfólio, abra `demo/index.html`; suas operações de escrita são bloqueadas.

## Retorno

Antes de qualquer implantação futura, mantenha a versão anterior identificada. O repositório não executa deploy automático nem configura acionadores. Esta importação não modificou o projeto institucional.
