export function isAtBottom(scrollableElement) {
  return scrollableElement.scrollTop + scrollableElement.clientHeight >= scrollableElement.scrollHeight;
}

export function scrollToBottom(scrollableElement) {
  scrollableElement.scrollTop = scrollableElement.scrollHeight;
}
