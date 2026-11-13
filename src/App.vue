<script setup>
import { usePostsStore } from './stores/posts'
import ComposerForm from './components/ComposerForm.vue'
import PostList from './components/PostList.vue'

// App 是协调者：连接 UI 事件与 store 操作，不持有业务状态
const store = usePostsStore()

function handlePublish({ title, content }) {
  store.publish({ title, content })
}

function handleUpdate({ id, content }) {
  store.updatePost(id, { content })
}

function handleDelete(id) {
  if (window.confirm('确定要删除这条日志吗？')) {
    store.removePost(id)
  }
}

function handleClearAll() {
  if (store.posts.length === 0) {
    window.alert('当前没有日志，无需清空。')
    return
  }
  if (window.confirm(`确定要清空全部 ${store.postCount} 条日志吗？此操作不可恢复！`)) {
    store.clearAll()
  }
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="brand">
        <span class="logo">Q</span>
        <h1 class="brand-name">QL-BLog</h1>
      </div>
      <span class="badge" data-testid="post-count">{{ store.postCount }} 条日志</span>
    </header>

    <p v-if="store.storageError" class="storage-error" role="alert">
      {{ store.storageError }}
    </p>

    <ComposerForm @publish="handlePublish" />

    <PostList
      :posts="store.sortedPosts"
      @update="handleUpdate"
      @delete="handleDelete"
    />

    <footer class="footer">
      <button class="btn btn-danger" type="button" data-testid="clear-btn" @click="handleClearAll">
        清空全部日志
      </button>
      <p class="copyright">QL-BLog · 数据保存在本浏览器 Local Storage 中</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(30, 136, 229, 0.35);
  transition: transform 0.25s ease;
}

.brand:hover .logo {
  transform: rotate(-8deg) scale(1.05);
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.badge {
  background: var(--card);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.storage-error {
  background: #fdecec;
  color: var(--danger);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 14px;
}

.footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.copyright {
  font-size: 12px;
  color: #b0bec5;
}

@media (max-width: 600px) {
  .app {
    padding: 16px 12px 40px;
  }

  .brand-name {
    font-size: 20px;
  }
}
</style>
