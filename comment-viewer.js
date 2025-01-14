import { commentCollector } from './modules/comment-collector.js';
import { html, html_unsafe } from './modules/helpers/html.js';

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
