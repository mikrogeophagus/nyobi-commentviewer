export class Comment {
  static #video = document.querySelector('div[aria-label="動画プレイヤー"] video')
  static #time = document.querySelector('div[aria-label="動画プレイヤー"] time')

  static COMMENT = 'comment'
  static OFFICIAL_COMMENT = 'officialComment'

  constructor(type, text, time) {
    this.type = type
    this.text = text
    this.time = time ?? Comment.#video.currentTime
    this.formattedTime = Comment.#time.textContent
  }

  // TODO: `time` プロパティの再生時間を整形して返すようにする
  // get formattedTime() {}
}

export class CommentCollector extends EventTarget {
  static #videoPlayer = document.querySelector('div[aria-label="動画プレイヤー"]')
  static #informationBar = CommentCollector.#videoPlayer.querySelector('div:first-child')

  /**
   * 収集したコメントの配列
   * @type {Comment[]}
   */
  collection = []

  /**
   * コメントをコレクションに追加して `collect` イベントを配信する
   * @param {Comment} comment - コメント
   */
  collect(comment) {
    this.collection.push(comment)
    this.dispatchEvent(new CustomEvent('collect', { detail: comment }))
  }

  constructor({
    shouldCollectComments = true,
    shouldCollectOfficialComments = true,
  } = {}) {
    super()

    // MARK: コメント取得処理
    if (shouldCollectComments) {
      const texts = new Set()

      CanvasRenderingContext2D.prototype.fillText = new Proxy(
        CanvasRenderingContext2D.prototype.fillText,
        {
          apply: (target, thisArgument, argumentsList) => {
            const [text] = argumentsList

            /*
             * 1 つのコメントに対して 2 回 `fillText()` メソッドが呼び出されてしまうので、コメントが重複しないようにする
             * なお、直前のコメントを保持して比較する方法では同時に複数のコメントが流れてきた場合に対応できないので、ここでは `Set` オブジェクトを使用している
             */
            if (text && texts.has(text)) {
              const comment = new Comment(Comment.COMMENT, text)
              this.collect(comment)
              texts.delete(text)
            } else {
              texts.add(text)
            }

            return Reflect.apply(target, thisArgument, argumentsList)
          },
        },
      )
    }

    // MARK: 運営コメント取得処理
    if (shouldCollectOfficialComments) {
      /**
       * 子要素として `<a>` 要素のみを持つ `<div>` 要素  
       * または子要素を全く持たない `<div>` 要素を表すセレクター
       */
      const selector = 'div:not(:has(:not(a)))'

      new MutationObserver(() => {
        const text = CommentCollector.#informationBar
          ?.querySelector(selector)
          ?.innerHTML

        if (text) {
          const officialComment = new Comment(Comment.OFFICIAL_COMMENT, text)
          this.collect(officialComment)
        }
      }).observe(CommentCollector.#informationBar, {
        subtree: true,
        childList: true,
      })
    }
  }
}
