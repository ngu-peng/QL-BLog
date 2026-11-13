import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 单独使用 .mjs 配置，避免 Node 在 CJS 加载器下解析 ESM 配置时的内部断言问题
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.js'],
    restoreMocks: true,
  },
})
