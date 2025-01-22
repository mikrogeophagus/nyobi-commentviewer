import { commentCollector } from './modules/comment-collector.js'
import { html, html_unsafe } from './modules/helpers/html.js'
import { isAtBottom, scrollToBottom } from './modules/helpers/scroll.js'

const videoPlayer = document.querySelector('[aria-label="動画プレイヤー"]')
const videoPlayerContainer = videoPlayer.parentElement.parentElement

const videoElement = document.querySelector('video')
const asideElement = document.querySelector('aside')
const timeElement = document.querySelector('time')

const commentPanel = html`<div id="comment-panel"></div>`
const commentList = html`<ul id="comment-list" class="comment-list"></ul>`
const commentToolbar = html`
  <div class="comment-toolbar">
    <label for="position-select">表示位置</label>
  </div>
`
const positionSelect = html`
  <select id="position-select">
    <option value="top-right">右上</option>
    <option value="bottom-left" selected>左下</option>
  </select>
`

commentToolbar.append(positionSelect)
commentPanel.append(commentList, commentToolbar)

// デフォルトでは動画プレイヤーの下に配置する
videoPlayerContainer.append(commentPanel)

// 表示位置の切り替え
positionSelect.addEventListener('change', (event) => {
  const position = event.target.value

  switch (position) {
    case 'top-right':
      asideElement.prepend(commentPanel)
      break
    case 'bottom-left':
      videoPlayerContainer.append(commentPanel)
      break
  }

  scrollToBottom(commentList)
  commentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

// ---------- コメントを取得して表示する ----------

commentCollector.addEventListener('collect', ({ detail: comment }) => {
  // FIXME: 再生時間の整形が面倒で動画プレイヤーから取得している
  comment.formattedTime = timeElement.textContent
  displayComment(comment)
})

videoElement.addEventListener('seeked', () => {
  while (commentList.firstChild) {
    commentList.removeChild(commentList.firstChild)
  }

  commentCollector.collection = commentCollector.collection.filter((comment) => {
    return comment.time < videoElement.currentTime - 3
  })

  commentCollector.collection.forEach((comment) => {
    displayComment(comment)
  })
})

function displayComment(comment) {
  // 既にリストの最後にスクロールしている場合のみ自動でスクロールする
  const shouldAutoScroll = isAtBottom(commentList)

  // TODO: イベントハンドラー属性を使用しないように変更する

  switch (comment.type) {
    case 'comment':
      commentList.append(html`
        <li class="comment">
          <a
            class="time"
            onclick="document.querySelector('video').currentTime = ${comment.time}"
            title="${comment.formattedTime} にジャンプする"
          >
            ${comment.formattedTime}
          </a>
          <span class="text">${comment.text}</span>
        </li>
      `)
      break
    case 'officialComment':
      commentList.append(html_unsafe`
        <li class="comment staff">
          <a
            class="time"
            onclick="document.querySelector('video').currentTime = ${comment.time}"
            title="${comment.formattedTime} にジャンプする"
          >
            ${comment.formattedTime}
          </a>
          <span class="text">${comment.text}</span>
        </li>
      `)
      break
  }

  if (shouldAutoScroll) scrollToBottom(commentList)
}
