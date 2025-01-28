export function isAtBottom(scrollableElement) {
  return scrollableElement.scrollTop + scrollableElement.clientHeight >= scrollableElement.scrollHeight
}

export function isNearBottom(scrollableElement, threshold = 50) {
  return scrollableElement.scrollTop + scrollableElement.clientHeight >= scrollableElement.scrollHeight - threshold
}

export function scrollToBottom(scrollableElement) {
  scrollableElement.scrollTop = scrollableElement.scrollHeight
}
