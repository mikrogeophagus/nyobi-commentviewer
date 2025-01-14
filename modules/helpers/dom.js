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
export function waitForSelector(selector, { timeoutMs = 10000 } = {}) {
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
