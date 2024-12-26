'use strict';

Promise.all([
  waitForSelector('video'),
  waitForSelector('canvas')
]).then(() => {
  const link = document.createElement('link');
  link.setAttribute('href', chrome.runtime.getURL('comment-viewer.css'));
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.setAttribute('src', chrome.runtime.getURL('comment-viewer.js'));
  script.setAttribute('type', 'text/javascript');
  document.body.appendChild(script);
}).catch((error) => {
  if (error.name === 'TimeoutError') {
    console.log('動画またはコメントが見つかりませんでした。コメビュの初期化を中断します。', error);
    return;
  }

  throw error;
});

/**
 * CSS セレクターに一致する HTML 要素が現れるまで待機する関数
 *
 * - セレクターに一致する要素が現れた場合、その要素で解決するプロミスを返す
 * - タイムアウトした場合、TimeoutError の DOMException で拒否するプロミスを返す
 *
 * @param {string} selector - CSS セレクター
 * @param {object} [options] - オプション設定
 * @param {number} [options.timeoutMs=10000] - タイムアウト時間（デフォルト値 10000 ミリ秒）
 * @returns {Promise<Element>} - CSS セレクターに一致する HTML 要素で解決するプロミス
 */
function waitForSelector(selector, { timeoutMs = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(timeout, timeoutMs);

    const observer = new MutationObserver(check);
    observer.observe(document, { childList: true, subtree: true });

    check();

    function check() {
      const element = document.querySelector(selector);

      if (element) {
        cleanup();
        resolve(element);
      }
    }

    function timeout() {
      cleanup();
      reject(new DOMException(
        `${selector} で選択される要素が ${timeoutMs}ms 以内に見つかりませんでした。`,
        'TimeoutError'
      ));
    }

    function cleanup() {
      clearTimeout(timeoutId);
      observer.disconnect();
    }
  });
}
