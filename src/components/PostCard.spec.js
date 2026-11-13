import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PostCard from './PostCard.vue'

beforeEach(() => localStorage.clear())

const POST = { id: 1700000000000, title: '测试标题', content: '测试正文内容' }

const mountCard = (post = POST) => mount(PostCard, { props: { post } })

describe('PostCard · 日志卡片', () => {
  it('展示标题、正文、时间与字数', () => {
    const w = mountCard()

    expect(w.find('[data-testid="post-title"]').text()).toBe('测试标题')
    expect(w.find('[data-testid="post-content"]').text()).toBe('测试正文内容')
    expect(w.find('[data-testid="post-time"]').text()).not.toBe('')
    expect(w.find('[data-testid="post-chars"]').text()).toBe('6 字')
  })

  it('标题为空时显示占位提示', () => {
    const w = mountCard({ ...POST, title: '' })

    expect(w.find('[data-testid="post-title"]').text()).toContain('无标题')
  })

  it('点击编辑进入编辑态，文本框预填原内容', async () => {
    const w = mountCard()

    await w.find('[data-testid="edit-btn"]').trigger('click')

    const textarea = w.find('[data-testid="edit-input"]')
    expect(textarea.exists()).toBe(true)
    expect(textarea.element.value).toBe('测试正文内容')
  })

  it('保存编辑：发出 update 事件并退出编辑态', async () => {
    const w = mountCard()
    await w.find('[data-testid="edit-btn"]').trigger('click')

    await w.find('[data-testid="edit-input"]').setValue('修改后的内容')
    await w.find('[data-testid="save-btn"]').trigger('click')

    expect(w.emitted('update')).toEqual([[{ id: POST.id, content: '修改后的内容' }]])
    expect(w.find('[data-testid="edit-input"]').exists()).toBe(false)
  })

  it('取消编辑：不发出任何事件并回到展示态', async () => {
    const w = mountCard()
    await w.find('[data-testid="edit-btn"]').trigger('click')
    await w.find('[data-testid="edit-input"]').setValue('随便改改')

    await w.find('[data-testid="cancel-btn"]').trigger('click')

    expect(w.emitted('update')).toBeUndefined()
    expect(w.find('[data-testid="post-content"]').text()).toBe('测试正文内容')
  })

  it('编辑后内容为空时点保存不发出 update 事件', async () => {
    const w = mountCard()
    await w.find('[data-testid="edit-btn"]').trigger('click')
    await w.find('[data-testid="edit-input"]').setValue('   ')

    await w.find('[data-testid="save-btn"]').trigger('click')

    expect(w.emitted('update')).toBeUndefined()
    expect(w.find('[data-testid="edit-input"]').exists()).toBe(true)
  })

  it('点击删除发出 delete 事件并携带日志 id', async () => {
    const w = mountCard()

    await w.find('[data-testid="delete-btn"]').trigger('click')

    expect(w.emitted('delete')).toEqual([[POST.id]])
  })
})
