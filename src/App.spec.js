import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import App from './App.vue'
import { STORAGE_KEY } from './stores/posts'

const mountApp = () => mount(App, { global: { plugins: [createPinia()] } })

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const titleInput = (w) => w.find('input')
const contentInput = (w) => w.find('textarea')
const postCards = (w) => w.findAll('.post-card')

describe('App · 页面集成', () => {
  it('初始渲染：标题栏计数为 0，显示空状态', () => {
    const w = mountApp()

    expect(w.text()).toContain('QL-BLog')
    expect(w.find('[data-testid="post-count"]').text()).toBe('0 条日志')
    expect(w.text()).toContain('还没有任何日志')
  })

  it('发布日志：卡片出现、计数更新并写入 Local Storage', async () => {
    const w = mountApp()

    await titleInput(w).setValue('我的第一条')
    await contentInput(w).setValue('集成测试正文')
    await w.find('[data-testid="publish-btn"]').trigger('click')
    await flushPromises()

    expect(postCards(w)).toHaveLength(1)
    expect(w.text()).toContain('我的第一条')
    expect(w.find('[data-testid="post-count"]').text()).toBe('1 条日志')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('我的第一条')
  })

  it('编辑日志：保存后正文与本地存储同步更新', async () => {
    const w = mountApp()
    await contentInput(w).setValue('原始内容')
    await w.find('[data-testid="publish-btn"]').trigger('click')

    await w.find('[data-testid="edit-btn"]').trigger('click')
    await w.find('[data-testid="edit-input"]').setValue('编辑后的正文')
    await w.find('[data-testid="save-btn"]').trigger('click')
    await flushPromises()

    expect(w.text()).toContain('编辑后的正文')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].content).toBe('编辑后的正文')
  })

  it('删除日志：确认后卡片移除；取消确认则保留', async () => {
    const w = mountApp()
    await contentInput(w).setValue('待删除的日志')
    await w.find('[data-testid="publish-btn"]').trigger('click')

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await w.find('[data-testid="delete-btn"]').trigger('click')
    expect(confirmSpy).toHaveBeenCalled()
    expect(postCards(w)).toHaveLength(1)

    confirmSpy.mockReturnValue(true)
    await w.find('[data-testid="delete-btn"]').trigger('click')
    expect(postCards(w)).toHaveLength(0)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([])
  })

  it('清空全部：确认后列表与本地存储清空', async () => {
    const w = mountApp()
    await contentInput(w).setValue('A')
    await w.find('[data-testid="publish-btn"]').trigger('click')
    await contentInput(w).setValue('B')
    await w.find('[data-testid="publish-btn"]').trigger('click')
    expect(postCards(w)).toHaveLength(2)

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await w.find('[data-testid="clear-btn"]').trigger('click')

    expect(postCards(w)).toHaveLength(0)
    expect(w.find('[data-testid="post-count"]').text()).toBe('0 条日志')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([])
  })

  it('页面加载时从 Local Storage 恢复已有日志', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 123, title: '历史日志', content: '重启前的内容' }]),
    )

    const w = mountApp()

    expect(postCards(w)).toHaveLength(1)
    expect(w.text()).toContain('历史日志')
    expect(w.find('[data-testid="post-count"]').text()).toBe('1 条日志')
  })
})
