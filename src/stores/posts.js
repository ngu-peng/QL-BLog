import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Local Storage 统一使用的 key
export const STORAGE_KEY = 'ql-blog-posts'

/**
 * 日志仓库：QL-BLog 的唯一数据源
 *
 * 所有增删改只修改 posts 数组，然后统一 save() 持久化；
 * sortedPosts / postCount 等派生数据用 computed 自动更新。
 */
export const usePostsStore = defineStore('posts', () => {
  // ---------- 状态 ----------
  const posts = ref([])
  // 存储失败时的提示信息（如 Local Storage 被禁用/写满），供界面展示
  const storageError = ref('')

  // ---------- 派生数据 ----------
  const postCount = computed(() => posts.value.length)
  // 按时间倒序（id 是时间戳，最新在前）
  const sortedPosts = computed(() => [...posts.value].sort((a, b) => b.id - a.id))

  // ---------- 数据层 ----------
  // 从 Local Storage 读取；数据损坏时降级为空数组并清理脏数据
  function load() {
    storageError.value = ''
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const data = raw ? JSON.parse(raw) : []
      posts.value = Array.isArray(data) ? data : []
    } catch {
      posts.value = []
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 把当前 posts 写入 Local Storage
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
      storageError.value = ''
    } catch {
      storageError.value = '日志保存失败：浏览器存储空间不足或被禁用。'
    }
  }

  // ---------- 操作 ----------
  // 生成唯一 id：基于时间戳，若与现有日志冲突则自增，保证同一毫秒内连续发布也不重复
  function generateId() {
    let id = Date.now()
    while (posts.value.some((p) => p.id === id)) id += 1
    return id
  }

  // 发布日志：内容为空时返回 null（调用方可据此给出提示）
  function publish({ title = '', content = '' } = {}) {
    const trimmedContent = content.trim()
    if (!trimmedContent) return null

    const post = { id: generateId(), title: title.trim(), content: trimmedContent }
    posts.value.push(post)
    save()
    return post
  }

  // 编辑日志：正文为空时保持原内容不变；id 不存在时静默忽略
  function updatePost(id, { content = '' } = {}) {
    const post = posts.value.find((p) => p.id === id)
    const trimmedContent = content.trim()
    if (!post || !trimmedContent) return post ?? null

    post.content = trimmedContent
    save()
    return post
  }

  // 删除单条日志
  function removePost(id) {
    posts.value = posts.value.filter((p) => p.id !== id)
    save()
  }

  // 清空全部日志
  function clearAll() {
    posts.value = []
    save()
  }

  // Store 创建时自动加载一次
  load()

  return {
    posts,
    storageError,
    postCount,
    sortedPosts,
    load,
    save,
    publish,
    updatePost,
    removePost,
    clearAll,
  }
})
