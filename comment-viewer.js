'use strict';

const videoPlayer = document.querySelector('[aria-label="動画プレイヤー"]');
const asideElement = document.querySelector('aside');
const timeElement = document.querySelector('time');

// デフォルトでは動画プレイヤーの下に配置する
videoPlayer.parentElement.parentElement.insertAdjacentHTML('beforeend', `
  <div id="comment-panel">
    <ul id="comment-list" class="comment-list"></ul>
    <div class="comment-toolbar">
      <label for="position-select">表示位置</label>
      <select id="position-select">
        <option value="top-right">右上</option>
        <option value="bottom-left" selected>左下</option>
      </select>
    </div>
  </div>
`);

const commentPanel = document.querySelector('#comment-panel');
const commentList = commentPanel.querySelector('#comment-list');
const positionSelect = commentPanel.querySelector('#position-select');

// 表示位置の切り替え
positionSelect.addEventListener('change', (event) => {
  const position = event.target.value;

  if (position === 'top-right') asideElement.insertAdjacentElement('afterbegin', commentPanel);
  else if (position === 'bottom-left') videoPlayer.parentElement.parentElement.insertAdjacentElement('beforeend', commentPanel);

  commentList.scrollTop = commentList.scrollHeight;
  commentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ---------- コメントを取得して表示する ----------

class CommentCollector extends EventTarget {
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
}

const commetCollector = new CommentCollector();

commetCollector.addEventListener('collect', ({ detail: comment }) => {
  switch (comment.type) {
    case 'comment':
      showComment(comment.text);
      break;
    case 'officialComment':
      showOfficialComment(comment.text);
      break;
  }
});

function showComment(comment) {
  commentList.insertAdjacentHTML('beforeend', `
    <li class="comment">
      <span class="time">${timeElement.textContent}</span>
      <span class="text">${sanitize(comment)}</span>
    </li>
  `);

  commentList.scrollTop = commentList.scrollHeight;
}

function showOfficialComment(officialComment) {
  commentList.insertAdjacentHTML('beforeend', `
    <li class="comment staff">
      <span class="time">${timeElement.textContent}</span>
      <span class="text">${officialComment}</span>
    </li>
  `);

  commentList.scrollTop = commentList.scrollHeight;
}

function sanitize(text) {
  const element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
}
