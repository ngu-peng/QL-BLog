import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostList from './PostList.vue'

beforeEach(() => localStorage.clear())

const POSTS = [
  { id: 200, title: '新日志', content: '新的内容' },
  { id: 100, title: '', content: '旧的内容' },
]

describe('PostList · 日志列表', () => {
  it('没有日志时显示空状态提示', () => {
    const w = mount(PostList, { props: { posts: [] } })

    expect(w.text()).toContain('还没有任何日志')
    expect(w.findAllComponents({ name: 'PostCard' })).toHaveLength(0)
  })

  it('按传入顺序为每条日志渲染一张卡片', () => {
    const w = mount(PostList, { props: { posts: POSTS } })

    const cards = w.findAllComponents({ name: 'PostCard' })
    expect(cards).toHaveLength(2)
    expect(cards[0].props('post').id).toBe(200)
    expect(cards[1].props('post').id).toBe(100)
  })

  it('卡片发出的编辑/删除事件向上转发给父组件', async () => {
    const w = mount(PostList, { props: { posts: POSTS } })
    const firstCard = w.findAllComponents({ name: 'PostCard' })[0]

    firstCard.vm.$emit('update', { id: POSTS[0].id, content: '新内容' })
    firstCard.vm.$emit('delete', POSTS[0].id)
    await w.vm.$nextTick()

    expect(w.emitted('update')).toEqual([[{ id: 200, content: '新内容' }]])
    expect(w.emitted('delete')).toEqual([[200]])
  })
})
