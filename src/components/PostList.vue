<script setup>
import PostCard from './PostCard.vue'

// 列表只负责展示与转发事件，数据来自父组件（store 的 sortedPosts）
defineProps({
  posts: { type: Array, required: true },
})

const emit = defineEmits(['update', 'delete'])
</script>

<template>
  <main class="post-list">
    <div v-if="posts.length === 0" class="empty card">
      <div class="empty-icon">📝</div>
      <p>还没有任何日志<br />在上方输入框写下第一条吧～</p>
    </div>

    <template v-else>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @update="emit('update', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </main>
</template>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.empty {
  text-align: center;
  padding: 56px 20px;
  color: var(--text-sub);
  animation: fade-in-up 0.35s ease both;
}

.empty .empty-icon {
  font-size: 42px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.empty p {
  font-size: 14px;
  line-height: 1.8;
}
</style>
