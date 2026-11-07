import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
let html = readFileSync(new URL('src/Portal.html', root), 'utf8');
const adapter = readFileSync(new URL('demo/adapter.js', root), 'utf8');
html = html.replace('<base target="_top">', '')
  .replace('<?= SDC_PILOT_URL ?>', '#demo-note')
  .replace('<script>', `<script>${adapter}</script><script>`)
  .replace('<main class="wrap">', '<main class="wrap"><aside id="demo-note" role="note" style="background:#142d51;color:white;padding:18px 22px;border-radius:12px;margin-bottom:22px;line-height:1.6"><strong>DEMONSTRAÇÃO · DADOS FICTÍCIOS</strong><br>Explore o painel e os filtros. Revisões, provas e geração de documentos estão desativadas. Nenhum dado é enviado.</aside>')
  .replace('Acesso restrito · MVP 2.2<br>Dados protegidos', 'Portfólio · Interface 2.2<br>Ambiente demonstrativo')
  .replace('◉ Equipe autorizada', '◉ Modo demonstração')
  .replace('Valores obtidos dos indicadores oficiais do servidor.', 'Valores fictícios para demonstrar a interface.')
  .replace('Abrir avaliação piloto B1 ↗', 'Avaliação indisponível nesta demonstração')
  .replace('Abra a avaliação para testar o envio de respostas e a correção automática no servidor. O resultado será registrado apenas nas abas de homologação.', 'A interface recuperada apresenta este piloto. O código da avaliação não está incluído nesta demonstração.')
  .replace('Carregando dados da planilha…', 'Carregando exemplos locais…');
writeFileSync(new URL('demo/index.html', root), html);
console.log('demo/index.html generated from recovered frontend + isolated adapter.');
