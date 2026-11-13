import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { STORAGE_KEY, usePostsStore } from './posts'

// 每个测试都拿到干净的 Pinia 与干净的 localStorage
beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('usePostsStore · 初始化与持久化', () => {
  it('本地没有数据时，日志列表为空', () => {
    const store = usePostsStore()
    expect(store.posts).toEqual([])
    expect(store.postCount).toBe(0)
  })

  it('启动时自动从 Local Storage 读取已有日志', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 1, title: '旧日志', content: '历史内容' }]),
    )

    const store = usePostsStore()

    expect(store.posts).toHaveLength(1)
    expect(store.posts[0].content).toBe('历史内容')
  })

  it('本地数据损坏时降级为空列表，并清理脏数据', () => {
    localStorage.setItem(STORAGE_KEY, '{ 这不是合法 JSON')

    const store = usePostsStore()

    expect(store.posts).toEqual([])
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('本地数据不是数组时也降级为空列表', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))

    const store = usePostsStore()

    expect(store.posts).toEqual([])
  })
})

describe('usePostsStore · 发布日志', () => {
  it('发布后日志进入列表并写入 Local Storage', () => {
    const store = usePostsStore()

    store.publish({ title: '第一条', content: '你好 QL-BLog' })

    expect(store.posts).toHaveLength(1)
    expect(store.posts[0]).toMatchObject({ title: '第一条', content: '你好 QL-BLog' })
    expect(store.posts[0].id).toBeTypeOf('number')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(1)
    expect(stored[0].content).toBe('你好 QL-BLog')
  })

  it('发布时去除首尾空白，标题可以为空', () => {
    const store = usePostsStore()

    store.publish({ title: '   ', content: '  只有正文  ' })

    expect(store.posts[0].title).toBe('')
    expect(store.posts[0].content).toBe('只有正文')
  })

  it('正文为空时拒绝发布', () => {
    const store = usePostsStore()

    const result = store.publish({ title: '标题', content: '   ' })

    expect(result).toBeNull()
    expect(store.posts).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('按时间倒序返回日志（最新在前）', () => {
    const store = usePostsStore()
    store.publish({ title: '', content: '先发的' })
    store.posts[0].id = 100
    store.publish({ title: '', content: '后发的' })
    store.posts[1].id = 200

    expect(store.sortedPosts.map((p) => p.content)).toEqual(['后发的', '先发的'])
  })
})

describe('usePostsStore · 编辑与删除', () => {
  it('编辑会更新正文并持久化，同时保留原 id', () => {
    const store = usePostsStore()
    store.publish({ title: '标题', content: '原来的内容' })
    const { id } = store.posts[0]

    store.updatePost(id, { content: '改过的内容' })

    expect(store.posts[0].content).toBe('改过的内容')
    expect(store.posts[0].id).toBe(id)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].content).toBe('改过的内容')
  })

  it('编辑时正文为空则保持原内容不变', () => {
    const store = usePostsStore()
    store.publish({ title: '', content: '原来的内容' })

    store.updatePost(store.posts[0].id, { content: '  ' })

    expect(store.posts[0].content).toBe('原来的内容')
  })

  it('编辑不存在的日志不会报错', () => {
    const store = usePostsStore()

    expect(() => store.updatePost(999, { content: 'x' })).not.toThrow()
    expect(store.posts).toHaveLength(0)
  })

  it('连续快速发布时每条日志的 id 保持唯一', () => {
    const store = usePostsStore()
    store.publish({ title: '', content: '第一条' })
    store.publish({ title: '', content: '第二条' })

    const ids = store.posts.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('删除单条日志并持久化', () => {
    const store = usePostsStore()
    store.publish({ title: '', content: '要留下的' })
    store.publish({ title: '', content: '要删掉的' })
    const doomedId = store.posts[1].id

    store.removePost(doomedId)

    expect(store.posts).toHaveLength(1)
    expect(store.posts[0].content).toBe('要留下的')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(1)
  })

  it('清空全部日志后本地存储为 []', () => {
    const store = usePostsStore()
    store.publish({ title: '', content: 'A' })
    store.publish({ title: '', content: 'B' })

    store.clearAll()

    expect(store.posts).toEqual([])
    expect(store.postCount).toBe(0)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([])
  })
})
