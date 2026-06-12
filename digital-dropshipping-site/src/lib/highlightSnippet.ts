/**
 * Syntax highlighter for the homepage CodingShowcase panel.
 * Why a dedicated module: the original inline version's later regex rules
 * matched the class="" attributes of spans inserted by earlier rules,
 * printing raw `"text-cyan-300">` artifacts on screen. This version stashes
 * comments and strings behind sentinel placeholders FIRST, so no later rule
 * can ever touch generated markup, then restores them at the end.
 */
export function highlightSnippetLine(line: string): string {
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens: string[] = [];
  // ASCII sentinel that never occurs in the display snippets.
  const stash = (html: string): string => '@@UNITIV_TK_' + (tokens.push(html) - 1) + '@@';

  let out = escaped
    // comments first - they swallow the rest of the line
    .replace(/(\/\/.*$)/g, (m) => stash('<span class="text-white/40">' + m + '</span>'))
    // strings (double then single)
    .replace(/("[^"]*")/g, (m) => stash('<span class="text-emerald-300">' + m + '</span>'))
    .replace(/('[^']*')/g, (m) => stash('<span class="text-emerald-300">' + m + '</span>'))
    // keywords / types / HTTP verbs - can no longer touch stashed content
    .replace(
      /\b(import|from|const|let|type|async|await|return|if|throw|new|export|function)\b/g,
      '<span class="text-cyan-300">$1</span>',
    )
    .replace(/\b(string|number|boolean|any|undefined|void)\b/g, '<span class="text-violet-300">$1</span>')
    .replace(/\b(POST|GET|PUT|DELETE)\b/g, '<span class="text-yellow-300">$1</span>')
    .replace(/(✔|📊|💰|📅|👨‍💻)/g, '<span class="text-emerald-400">$1</span>');

  // restore stashed comments/strings
  out = out.replace(/@@UNITIV_TK_(\d+)@@/g, (_m, i) => tokens[Number(i)]);
  return out;
}
