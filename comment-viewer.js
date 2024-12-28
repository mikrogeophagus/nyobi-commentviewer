'use strict';

const videoPlayer = document.querySelector('[aria-label="動画プレイヤー"]');
const asideElement = document.querySelector('aside');
const timeElement = document.querySelector('time');

const commentPanel = html`<div id="comment-panel"></div>`;
const commentList = html`<ul id="comment-list" class="comment-list"></ul>`;
const commentToolbar = html`
  <div class="comment-toolbar">
    <label for="position-select">表示位置</label>
  </div>
`;
const positionSelect = html`
  <select id="position-select">
    <option value="top-right">右上</option>
    <option value="bottom-left" selected>左下</option>
  </select>
`;

commentToolbar.append(positionSelect);
commentPanel.append(commentList, commentToolbar);

// デフォルトでは動画プレイヤーの下に配置する
videoPlayer.parentElement.parentElement.insertAdjacentElement('beforeend', commentPanel);

// 表示位置の切り替え
positionSelect.addEventListener('change', (event) => {
  const position = event.target.value;

  if (position === 'top-right') asideElement.insertAdjacentElement('afterbegin', commentPanel);
  else if (position === 'bottom-left') videoPlayer.parentElement.parentElement.insertAdjacentElement('beforeend', commentPanel);

  commentList.scrollTop = commentList.scrollHeight;
  commentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ---------- コメントを取得して表示する ----------

const commentCollector = new (class extends EventTarget {
  collection = [];

  constructor() {
    super();

    const self = this;

    const video = document.querySelector('video');
    const informationBar = document.querySelector([
      'div[aria-label="動画プレイヤー"]',
      'div:first-child'
    ].join('>'));

    // 以下、コメント取得処理

    const comments = new Set();
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;

    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      const comment = args.at(0);

      // 1 つのコメントに対して 2 回 fillText() が呼び出されてしまうので、コメントが重複しないようにする
      if (comment && comments.has(comment)) {
        const data = { type: 'comment', text: comment, time: video.currentTime };
        self.dispatchEvent(new CustomEvent('collect', { detail: data }));
        self.collection.push(data);
        comments.delete(comment);
      } else {
        comments.add(comment);
      }

      return originalFillText.apply(this, args);
    }

    // 以下、運営コメント取得処理

    new MutationObserver(() => {
      // 子要素として <a> 要素のみを持つ <div> 要素、または子要素を全く持たない <div> 要素を取得
      const wrapper = informationBar.querySelector('div:not(:has(:not(a)))');

      if (wrapper && wrapper.innerHTML) {
        const officialComment = wrapper.innerHTML;
        const data = { type: 'officialComment', text: officialComment, time: video.currentTime };
        self.dispatchEvent(new CustomEvent('collect', { detail: data }));
        self.collection.push(data);
      }
    }).observe(informationBar, {
      subtree: true,
      childList: true
    });
  }
})();

commentCollector.addEventListener('collect', ({ detail: comment }) => {
  switch (comment.type) {
    case 'comment':
      commentList.insertAdjacentElement('beforeend', html`
        <li class="comment">
          <span class="time">${timeElement.textContent}</span>
          <span class="text">${comment.text}</span>
        </li>
      `);
      break;
    case 'officialComment':
      commentList.insertAdjacentElement('beforeend', html_unsafe`
        <li class="comment staff">
          <span class="time">${timeElement.textContent}</span>
          <span class="text">${comment.text}</span>
        </li>
      `);
      break;
  }

  commentList.scrollTop = commentList.scrollHeight;
});

/**
 * HTML の文字列をもとに要素を生成するタグ関数  
 * トップレベルの要素は 1 つまでとする
 * 
 * @param {TemplateStringsArray} strings - HTML 文字列
 * @param {...any} values - 埋め込み式の値
 * @returns {?Element} - HTML 要素
 */
function html_unsafe(strings, ...values) {
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
function html(strings, ...values) {
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
function escapeHtml(string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
