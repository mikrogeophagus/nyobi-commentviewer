/**
 * HTML の文字列をもとに要素を生成するタグ関数  
 * トップレベルの要素は 1 つまでとする
 * 
 * @param {TemplateStringsArray} strings - HTML 文字列
 * @param {...any} values - 埋め込み式の値
 * @returns {?Element} - HTML 要素
 */
export function html_unsafe(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = String.raw({ raw: strings }, ...values);
  return template.content.firstElementChild;
}

/**
 * HTML の文字列をもとに要素を生成するタグ関数  
 * 埋め込み式の値が文字列の場合はエスケープする
 * 
 * @param {TemplateStringsArray} strings - HTML 文字列
 * @param {...any} values - 埋め込み式の値
 * @returns {?Element} - HTML 要素
 */
export function html(strings, ...values) {
  return html_unsafe(strings, ...values.map((value) => {
    return typeof value === 'string' ? escapeHtml(value) : value;
  }));
}

/**
 * HTML の特殊文字をエスケープする関数
 * 
 * @param {string} string - エスケープする文字列
 * @returns {string} - エスケープした文字列
 */
export function escapeHtml(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
