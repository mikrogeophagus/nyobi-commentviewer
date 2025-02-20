'use strict'

const moduleURL = chrome.runtime.getURL('modules/utils/dom.js')

import(moduleURL).then(({ waitForSelector }) => {
  Promise.all([
    waitForSelector('video'),
    waitForSelector('canvas'),
  ]).then(() => {
    const link = document.createElement('link')
    link.setAttribute('href', chrome.runtime.getURL('comment-viewer.css'))
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('type', 'text/css')
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.setAttribute('src', chrome.runtime.getURL('comment-viewer.js'))
    script.setAttribute('type', 'module')
    document.body.appendChild(script)
  }).catch((error) => {
    if (error.name === 'TimeoutError') {
      console.log(
        '動画またはコメントが見つかりませんでした。コメビュの初期化を中断します。',
        error,
      )
    } else {
      console.error(error)
    }
  })
}).catch((error) => {
  console.error(error)
})
