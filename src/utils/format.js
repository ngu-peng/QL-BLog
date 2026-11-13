// 时间戳 → 本地化时间字符串，如 "2026/11/13 15:30:05"
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false })
}
