import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ComposerForm from './ComposerForm.vue'

const mountForm = () => mount(ComposerForm)

beforeEach(() => localStorage.clear())

const titleInput = (w) => w.find('input')
const contentInput = (w) => w.find('textarea')
const publishBtn = (w) => w.find('[data-testid="publish-btn"]')
const charCount = (w) => w.find('[data-testid="char-count"]')

describe('ComposerForm · 发布表单', () => {
  it('初始状态：正文为空时发布按钮禁用，字数显示 0 / 500', () => {
    const w = mountForm()

    expect(publishBtn(w).attributes('disabled')).toBeDefined()
    expect(charCount(w).text()).toBe('0 / 500')
  })

  it('输入正文后按钮启用，字数统计实时更新', async () => {
    const w = mountForm()

    await contentInput(w).setValue('你好')
    expect(publishBtn(w).attributes('disabled')).toBeUndefined()
    expect(charCount(w).text()).toBe('2 / 500')
  })

  it('点击发布：触发 publish 事件并携带去除空白后的内容，随后清空输入框', async () => {
    const w = mountForm()
    await titleInput(w).setValue('  标题  ')
    await contentInput(w).setValue('  正文内容  ')

    await publishBtn(w).trigger('click')

    expect(w.emitted('publish')).toEqual([[{ title: '标题', content: '正文内容' }]])
    expect(titleInput(w).element.value).toBe('')
    expect(contentInput(w).element.value).toBe('')
    expect(publishBtn(w).attributes('disabled')).toBeDefined()
  })

  it('正文只有空白时点击发布不触发事件', async () => {
    const w = mountForm()
    await contentInput(w).setValue('   ')

    expect(publishBtn(w).attributes('disabled')).toBeDefined()

    await publishBtn(w).trigger('click')
    expect(w.emitted('publish')).toBeUndefined()
  })

  it('在正文输入框按 Ctrl+Enter 也可以发布', async () => {
    const w = mountForm()
    await contentInput(w).setValue('快捷发布')

    await contentInput(w).trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(w.emitted('publish')).toEqual([[{ title: '', content: '快捷发布' }]])
  })

  it('超过 500 字的输入被 maxlength 截断', () => {
    const w = mountForm()
    expect(contentInput(w).attributes('maxlength')).toBe('500')
    expect(titleInput(w).attributes('maxlength')).toBe('50')
  })
})
