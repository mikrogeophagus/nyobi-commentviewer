export const commentCollector = new (class extends EventTarget {
  collection = [];

  constructor() {
    super();

    const self = this;

    const videoPlayer = document.querySelector('div[aria-label="動画プレイヤー"]');
    const informationBar = videoPlayer.querySelector('div:first-child');
    const video = videoPlayer.querySelector('video');

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
      childList: true,
    });
  }
})();
