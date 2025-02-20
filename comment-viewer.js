import { Comment, CommentCollector } from './modules/comment-collector.js'
import { html, html_unsafe } from './modules/utils/html.js'
import { isNearBottom, scrollToBottom } from './modules/utils/scroll.js'

const videoPlayer = document.querySelector('[aria-label="動画プレイヤー"]')
const videoPlayerContainer = videoPlayer.parentElement.parentElement

const videoElement = document.querySelector('video')
const asideElement = document.querySelector('aside')

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

const commentCollector = new CommentCollector({
  shouldCollectComments: true,
  shouldCollectOfficialComments: true,
})

commentCollector.addEventListener('collect', ({ detail: comment }) => {
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
  const shouldAutoScroll = isNearBottom(commentList, 50)
  const isOfficialComment = comment.type === Comment.OFFICIAL_COMMENT

  const commentListItem = isOfficialComment
    ? html`<li class="comment official"></li>`
    : html`<li class="comment"></li>`

  const commentTime = html`
    <a
      class="time"
      title="${comment.formattedTime} にジャンプする"
    >
      ${comment.formattedTime}
    </a>
  `
  commentTime.addEventListener('click', () => {
    videoElement.currentTime = comment.time
  })

  const commentText = isOfficialComment
    ? html_unsafe`<span class="text">${comment.text}</span>`
    : html`<span class="text">${comment.text}</span>`

  commentListItem.append(commentTime, commentText)
  commentList.append(commentListItem)

  if (shouldAutoScroll) scrollToBottom(commentList)
}
