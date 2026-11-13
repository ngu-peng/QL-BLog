<script setup>
import { computed, shallowRef } from 'vue'

// 正文与标题的长度上限（与测试保持一致）
const MAX_TITLE = 50
const MAX_CONTENT = 500

// 表单输入是组件私有状态，不进 store
const title = shallowRef('')
const content = shallowRef('')

// 派生数据用 computed，不放在模板里算
const charCount = computed(() => `${content.value.length} / ${MAX_CONTENT}`)
const canPublish = computed(() => content.value.trim().length > 0)

const emit = defineEmits(['publish'])

function publish() {
  if (!canPublish.value) return

  // 发出事件前去除首尾空白，调用方拿到的是干净数据
  emit('publish', { title: title.value.trim(), content: content.value.trim() })
  // 发布成功后清空输入，方便连续发布
  title.value = ''
  content.value = ''
}
</script>

<template>
  <section class="card composer">
    <input
      v-model="title"
      class="composer-title"
      type="text"
      :maxlength="MAX_TITLE"
      placeholder="给这条日志起个标题（可选）"
    />
    <textarea
      v-model="content"
      class="composer-content"
      rows="4"
      :maxlength="MAX_CONTENT"
      placeholder="今天想说点什么……"
      @keydown.ctrl.enter="publish"
      @keydown.meta.enter="publish"
    ></textarea>
    <div class="composer-footer">
      <span class="char-count" data-testid="char-count">{{ charCount }}</span>
      <button
        class="btn btn-primary"
        type="button"
        data-testid="publish-btn"
        :disabled="!canPublish"
        @click="publish"
      >
        发 布
      </button>
    </div>
  </section>
</template>

<style scoped>
.composer {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.3s ease;
}

.composer:focus-within {
  box-shadow: var(--shadow-hover);
}

.composer-title {
  border: none;
  border-bottom: 1px solid var(--border);
  padding: 6px 2px 10px;
  font-size: 17px;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-main);
  outline: none;
  background: transparent;
}

.composer-title::placeholder {
  font-weight: 400;
  color: var(--text-sub);
}

.composer-content {
  border: none;
  resize: vertical;
  min-height: 90px;
  font-size: 14px;
  line-height: 1.7;
  font-family: inherit;
  color: var(--text-main);
  outline: none;
  background: transparent;
}

.composer-content::placeholder {
  color: var(--text-sub);
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.char-count {
  font-size: 12px;
  color: var(--text-sub);
}
</style>
