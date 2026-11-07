# Importação e pontos de atenção

Em 07/11/2026, os 24 arquivos foram copiados em modo somente leitura do histórico **Versão 18** do projeto Portal SDC — MVP 2.0. O Index identifica a interface como 2.2; esses números representam camadas diferentes. A associação de cada URL /exec a uma implantação não foi alterada nem verificada nesta importação.

`source-inventory.json` registra caminhos, SHA-256 da origem e SHA-256 da cópia pública. São 19 arquivos GS, quatro HTMLs e um manifesto. Três HTMLs antigos estão em `archive/v18/`. `Config.gs` é uma adição da distribuição pública. O snapshot `src/Portal.html` permanece dedicado à demonstração.

## Adaptações da cópia pública

- IDs da planilha e pasta substituídos por Script Properties.
- Listas de revisores e administradores derivadas de `SDC_REVIEWER_EMAILS`; configuração vazia nega acesso.
- URL institucional removida dos HTMLs. `doGet` avalia o template Index e fornece a URL do piloto a partir da própria implantação.
- Manifesto preservado, inclusive acesso MYSELF. Nenhuma função foi executada, nenhuma implantação ou planilha institucional foi alterada.

## Achados de leitura ainda abertos

1. A sincronização reinicia a varredura e conta arquivos conhecidos no limite de 400; arquivos posteriores podem ficar sem processamento. Falta paginação persistida.
2. A lista de assinaturas parte apenas das triagens aprovadas; vínculos automáticos por ID podem ficar fora dela.
3. A recomputação de sugestões preserva decisões humanas, mas recalcula ID e nome; precisa impedir associação de decisão antiga a nova sugestão.
4. Relatórios e dashboard têm critérios diferentes de validação: dashboard exige status e assinatura válida, enquanto relatórios contam status. Duplicidades podem distorcer estados e totais.
5. Registro, triagem e auditoria são gravações separadas; falta testar falhas parciais e recuperação.
6. Links vindos da base precisam de validação de destino além de escape HTML.
7. Identidade da sessão e permissões precisam ser testadas na implantação de homologação.

Não se tratam de falhas reproduzidas em produção. A importação mantém a lógica de origem para permitir revisão rastreável. O problema de escapes e função duplicada dos textos colados não apareceu nos arquivos reais: os módulos compilam juntos.

## Próxima etapa técnica

Usar uma planilha e pasta fictícias para homologar leitura, vínculo automático, revisão manual, assinatura, concorrência, repetição, relatórios e planos. O formulário escolar é outro projeto e não está incluído nesta exportação. Não há certificação CEFR automática; o piloto é técnico.
