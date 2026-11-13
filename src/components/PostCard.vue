<script setup>
import { computed, shallowRef } from 'vue'
import { formatTime } from '../utils/format'

const props = defineProps({
  post: { type: Object, required: true },
})

const emit = defineEmits(['update', 'delete'])

// 编辑态是卡片私有状态
const editing = shallowRef(false)
const draftContent = shallowRef('')

const charCount = computed(() => `${props.post.content.length} 字`)

function startEdit() {
  draftContent.value = props.post.content
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  draftContent.value = ''
}

function saveEdit() {
  const content = draftContent.value.trim()
  if (!content) return

  emit('update', { id: props.post.id, content })
  editing.value = false
}

function remove() {
  emit('delete', props.post.id)
}
</script>

<template>
  <article class="card post-card">
    <div class="post-header">
      <h2
        class="post-title"
        :class="{ 'no-title': !post.title }"
        data-testid="post-title"
      >
        {{ post.title || '（无标题）' }}
      </h2>
      <div class="post-actions">
        <button
          v-if="!editing"
          class="edit"
          type="button"
          data-testid="edit-btn"
          @click="startEdit"
        >
          编辑
        </button>
        <button class="del" type="button" data-testid="delete-btn" @click="remove">
          删除
        </button>
      </div>
    </div>

    <p v-if="!editing" class="post-content" data-testid="post-content">
      {{ post.content }}
    </p>
    <div v-else class="edit-area">
      <textarea
        v-model="draftContent"
        class="edit-input"
        data-testid="edit-input"
        rows="4"
        maxlength="500"
      ></textarea>
      <div class="edit-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-testid="cancel-btn" @click="cancelEdit">
          取消
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-testid="save-btn" @click="saveEdit">
          保存
        </button>
      </div>
    </div>

    <div class="post-meta">
      <span data-testid="post-time">{{ formatTime(post.id) }}</span>
      <span class="dot"></span>
      <span data-testid="post-chars">{{ charCount }}</span>
    </div>
  </article>
</template>

<style scoped>
.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.post-title {
  font-size: 17px;
  font-weight: 600;
  word-break: break-all;
}

.post-title.no-title {
  color: var(--text-sub);
  font-weight: 400;
  font-style: italic;
}

.post-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.post-actions button {
  border: none;
  background: none;
  font-size: 12px;
  color: var(--text-sub);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.post-actions button:hover {
  background: #eef3f8;
  color: var(--primary);
}

.post-actions button.del:hover {
  color: var(--danger);
  background: #fdecec;
}

.post-content {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-main);
}

.post-meta {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-meta .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #b0bec5;
}

.edit-area {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-area textarea {
  width: 100%;
  border: 1px solid var(--primary);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.7;
  font-family: inherit;
  resize: vertical;
  min-height: 90px;
  outline: none;
  color: var(--text-main);
  background: #f7fafd;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}
</style>
