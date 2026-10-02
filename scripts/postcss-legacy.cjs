// Alternativas de CSS para navegadores antigos (iOS 9–14, Android 5…), geradas no build.
//
// Nada muda para aparelhos novos: as regras extras só valem quando src/legacy/compat.js
// marca o <html> com .no-grid, .no-flexgap ou .no-webp (o recurso não existe no aparelho).
//
// - display: grid  → flex com quebra de linha e larguras calculadas (.no-grid)
// - gap em flex    → margens entre os filhos (.no-flexgap)
// - inset          → top/right/bottom/left
// - :is(a, b)      → seletores expandidos
// - clamp/min/max  → valor simples antes, como reserva

const GRID_COLS = [1, 2, 3, 4, 5, 6];

function splitTop(value, sep = ',') {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === sep && depth === 0) { parts.push(current.trim()); current = ''; continue; }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

// Troca a primeira função fn(...) pelo argumento escolhido, até não sobrar nenhuma.
function replaceFn(value, fn, pick) {
  let guard = 0;
  let index;
  while ((index = value.search(new RegExp(`(^|[^-\\w])${fn}\\(`))) !== -1 && guard++ < 20) {
    const start = value.indexOf(`${fn}(`, index);
    let depth = 0;
    let end = start + fn.length;
    for (; end < value.length; end++) {
      if (value[end] === '(') depth++;
      if (value[end] === ')' && --depth === 0) break;
    }
    const args = splitTop(value.slice(start + fn.length + 1, end));
    value = value.slice(0, start) + pick(args) + value.slice(end + 1);
  }
  return value;
}

function simplifyMath(value) {
  let out = replaceFn(value, 'clamp', (args) => args[1] || args[0]);
  out = replaceFn(out, 'min', (args) => args.find((arg) => !/var\(/.test(arg)) || args[0]);
  out = replaceFn(out, 'max', (args) => args.find((arg) => !/var\(|env\(/.test(arg)) || args[0]);
  return out;
}

function expandIs(selector) {
  const match = selector.match(/:is\(/);
  if (!match) return [selector];
  const start = match.index;
  let depth = 0;
  let end = start + 3;
  for (; end < selector.length; end++) {
    if (selector[end] === '(') depth++;
    if (selector[end] === ')' && --depth === 0) break;
  }
  const options = splitTop(selector.slice(start + 4, end));
  return options.flatMap((option) => expandIs(selector.slice(0, start) + option + selector.slice(end + 1)));
}

const prefix = (cls, selectors) => selectors.map((sel) => `.${cls} ${sel}`).join(',\n');
const children = (selectors, suffix = '') => selectors.map((sel) => `${sel} > *${suffix}`);

// Colunas de grid-template-columns: número, "auto-fit" (com largura mínima) ou null (variável → uma linha só).
function parseColumns(template) {
  const repeat = template.match(/^repeat\((.*)\)$/);
  if (!repeat) {
    const tracks = splitTop(template, ' ');
    return { count: tracks.length };
  }
  const [count, track] = splitTop(repeat[1]);
  if (/auto-(fit|fill)/.test(count)) {
    const min = track.match(/minmax\(([^,]+),/);
    return { auto: min ? min[1].trim() : '6rem' };
  }
  if (/^\d+$/.test(count)) return { count: Number(count) };
  const literal = count.match(/,\s*(\d+)\s*\)/); // min(var(--x), 3)
  return literal ? { count: Number(literal[1]) } : { single: true };
}

function columnRules(postcss, selectors, columns, gap) {
  const g = gap || '0px';
  const rules = [];
  // !important: nas grades, o espaçamento das colunas manda (as classes gap-N do Tailwind
  // também viram margem em .no-flexgap e somariam com esta).
  const rule = (sels, decls) => {
    const r = postcss.rule({ selector: sels.join(',\n') });
    Object.entries(decls).forEach(([prop, value]) => r.append({ prop, value, important: true }));
    rules.push(r);
  };
  if (columns.single) {
    rule(children(selectors), { flex: '1 1 0', 'min-width': '0', 'margin-left': '0' });
    rule(children(selectors, ' + *'), { 'margin-left': g });
  } else if (columns.auto) {
    rule(children(selectors), { flex: `1 1 ${columns.auto}`, margin: `calc(${g} / 2)` });
  } else {
    const n = columns.count;
    rule(children(selectors), { width: `calc((100% - ${n - 1} * ${g}) / ${n})`, 'margin-bottom': g });
    // :nth-child(n) desfaz o zero de outra quantidade de colunas (regra de tela maior).
    rule(children(selectors, ':nth-child(n)'), { 'margin-left': g });
    rule(children(selectors, `:nth-child(${n}n+1)`), { 'margin-left': '0' });
  }
  return rules;
}

module.exports = () => ({
  postcssPlugin: 'aprender-legacy',
  OnceExit(root, { postcss }) {
    const gaps = new Map(); // seletor → gap (para as regras de mídia que só trocam as colunas)
    const after = [];       // [nó de referência, regras novas]

    root.walkRules((rule) => {
      if (rule.selector.startsWith('.no-')) return;

      if (rule.selector.includes(':is(')) {
        rule.selectors = rule.selectors.flatMap(expandIs);
      }

      const decls = {};
      rule.each((node) => { if (node.type === 'decl') decls[node.prop] = node.value; });
      const selectors = rule.selectors;
      const key = selectors.join(',');
      const extra = [];

      rule.walkDecls((decl) => {
        if (decl.prop === 'inset') {
          const [t, r = t, b = t, l = r] = decl.value.split(/\s+/);
          decl.cloneBefore({ prop: 'top', value: t });
          decl.cloneBefore({ prop: 'right', value: r });
          decl.cloneBefore({ prop: 'bottom', value: b });
          decl.cloneBefore({ prop: 'left', value: l });
        }
        if (/(^|[^-\w])(clamp|min|max)\(/.test(decl.value) && !/grid-template/.test(decl.prop)) {
          const simple = simplifyMath(decl.value);
          if (simple !== decl.value) decl.cloneBefore({ value: simple });
        }
      });

      const isGrid = decls.display === 'grid';
      if (decls.gap) gaps.set(key, decls.gap);
      const gap = decls.gap || gaps.get(key);

      if (isGrid) {
        const flex = postcss.rule({ selector: prefix('no-grid', selectors) });
        flex.append({ prop: 'display', value: 'flex' });
        if (decls['grid-template-columns']) flex.append({ prop: 'flex-wrap', value: 'wrap' });
        if (decls['place-items'] === 'center') {
          flex.append({ prop: 'align-items', value: 'center' });
          flex.append({ prop: 'justify-content', value: 'center' });
        }
        extra.push(flex);
      }
      if (decls['grid-template-columns']) {
        const sels = selectors.map((sel) => `.no-grid ${sel}`);
        if (!isGrid) extra.push(postcss.rule({ selector: sels.join(',\n') }).append({ prop: 'flex-wrap', value: 'wrap' }));
        extra.push(...columnRules(postcss, sels, parseColumns(decls['grid-template-columns']), gap));
      } else if (decls.gap && !isGrid && !/^\.gap-/.test(key)) {
        // (utilitários gap-N do Tailwind são tratados no fim, conforme flex-col/flex-wrap)
        // gap em flex: margem entre filhos na direção da linha.
        const column = /column/.test(decls['flex-direction'] || '');
        const wrap = /wrap/.test(decls['flex-wrap'] || '');
        const sels = selectors.map((sel) => `.no-flexgap ${sel}`);
        const r = postcss.rule({ selector: children(sels, wrap ? '' : ' + *').join(',\n') });
        if (wrap) r.append({ prop: 'margin', value: `calc(${decls.gap} / 2)` });
        else r.append({ prop: column ? 'margin-top' : 'margin-left', value: decls.gap });
        extra.push(r);
      }

      if (extra.length) after.push([rule, extra]);
    });

    // Utilitários do Tailwind: .grid + .grid-cols-N + .gap-M vêm em classes separadas.
    const gapUtils = [];
    root.walkRules(/^\.gap-[\d.]+$|^\.gap-\\\[/, (rule) => {
      rule.walkDecls('gap', (decl) => gapUtils.push([rule.selector, decl.value]));
    });
    const tail = [];
    GRID_COLS.forEach((n) => {
      tail.push(...columnRules(postcss, [`.no-grid .grid.grid-cols-${n}`], { count: n }, '0px'));
      gapUtils.forEach(([gapSel, value]) => {
        tail.push(...columnRules(postcss, [`.no-grid .grid.grid-cols-${n}${gapSel}`], { count: n }, value));
      });
    });
    tail.push(postcss.rule({ selector: '.no-grid .grid' }).append({ prop: 'display', value: 'flex' }, { prop: 'flex-wrap', value: 'wrap' }));
    gapUtils.forEach(([gapSel, value]) => {
      tail.push(postcss.rule({ selector: `.no-flexgap ${gapSel}:not(.grid):not(.flex-col):not(.flex-wrap) > * + *` }).append({ prop: 'margin-left', value }));
      tail.push(postcss.rule({ selector: `.no-flexgap .flex-col${gapSel} > * + *` }).append({ prop: 'margin-top', value }));
      tail.push(postcss.rule({ selector: `.no-flexgap .flex-wrap${gapSel}:not(.grid) > *` }).append({ prop: 'margin', value: `calc(${value} / 2)` }));
    });

    after.forEach(([rule, extra]) => {
      let ref = rule;
      extra.forEach((node) => { ref.after(node); ref = node; });
    });
    tail.forEach((node) => root.append(node));
  }
});
module.exports.postcss = true;
