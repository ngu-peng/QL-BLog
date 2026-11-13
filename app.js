/* ============================================================
   QL-BLog 核心逻辑（原生 JavaScript，无框架）
   数据流：用户输入 → 修改 posts 数组 → save() 持久化 → render() 重绘
   ============================================================ */

// ---------- 常量 ----------
const STORAGE_KEY = 'ql-blog-posts'; // Local Storage 中统一使用的 key
const MAX_CONTENT = 500;             // 正文字数上限（与 index.html 的 maxlength 保持一致）

// ---------- 全局状态 ----------
// 所有日志都存在这个数组里，增删改只改数组，然后统一 save + render
let posts = [];

// ---------- DOM 元素引用 ----------
const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');
const publishBtn = document.getElementById('publish-btn');
const charCount = document.getElementById('char-count');
const postCount = document.getElementById('post-count');
const postList = document.getElementById('post-list');
const clearBtn = document.getElementById('clear-btn');

/* ============================================================
   数据层：Local Storage 的读与写
   ============================================================ */

// 从 Local Storage 读取日志；数据损坏时降级为空数组
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    // 保证读到的始终是数组，避免脏数据导致后续报错
    posts = Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('QL-BLog：本地数据解析失败，已重置为空列表。', e);
    posts = [];
    localStorage.removeItem(STORAGE_KEY); // 清理脏数据
  }
}

// 把当前 posts 数组写入 Local Storage
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    // 存储空间满或被禁用等极端情况，只提示不崩溃
    console.error('QL-BLog：保存失败。', e);
    alert('日志保存失败，可能是浏览器存储空间不足或被禁用。');
  }
}

/* ============================================================
   工具函数
   ============================================================ */

// HTML 转义：防止用户输入的内容被当作 HTML 执行（XSS 防护）
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 时间戳 → 本地化时间字符串，如 "2026/11/13 15:30:05"
function formatTime(ts) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

// 根据 id 找到对应的日志对象
function findPost(id) {
  return posts.find((p) => p.id === id);
}

/* ============================================================
   渲染：把 posts 数组绘制成页面上的卡片列表
   ============================================================ */

function render() {
  // 顶部总数徽章
  postCount.textContent = posts.length + ' 条日志';

  // 空状态
  if (posts.length === 0) {
    postList.innerHTML =
      '<div class="empty card">' +
      '<div class="empty-icon">📝</div>' +
      '<p>还没有任何日志<br>在上方输入框写下第一条吧～</p>' +
      '</div>';
    return;
  }

  // 按时间倒序（最新的在最上面）
  const sorted = [...posts].sort((a, b) => b.id - a.id);

  // innerHTML 整体重绘（个人使用日志量小，性能足够）
  postList.innerHTML = sorted
    .map(function (p) {
      return (
        '<article class="card post-card" data-id="' + p.id + '">' +
        '  <div class="post-header">' +
        '    <h2 class="post-title' + (p.title ? '' : ' no-title') + '">' +
        (p.title ? escapeHtml(p.title) : '（无标题）') +
        '    </h2>' +
        '    <div class="post-actions">' +
        '      <button class="edit" data-id="' + p.id + '">编辑</button>' +
        '      <button class="del" data-id="' + p.id + '">删除</button>' +
        '    </div>' +
        '  </div>' +
        '  <p class="post-content">' + escapeHtml(p.content) + '</p>' +
        '  <div class="post-meta">' +
        '    <span>' + formatTime(p.id) + '</span>' +
        '    <span class="dot"></span>' +
        '    <span>' + p.content.length + ' 字</span>' +
        '  </div>' +
        '</article>'
      );
    })
    .join('');
}

/* ============================================================
   业务操作：发布 / 编辑 / 删除 / 清空
   ============================================================ */

// 发布：读取输入框内容，追加到数组头部，然后清空输入框
function publish() {
  const content = contentInput.value.trim();
  if (!content) return; // 空内容不发布（按钮禁用是第一道防线，这里是兜底）

  posts.push({
    id: Date.now(),               // 时间戳作为唯一 id，同时可用于排序
    title: titleInput.value.trim(),
    content: content,
  });

  save();
  render();

  // 清空并聚焦，方便连续发布
  titleInput.value = '';
  contentInput.value = '';
  updateComposerState();
  contentInput.focus();
}

// 编辑：把卡片切换成编辑态（textarea），保存或取消
function startEdit(id, cardEl) {
  const post = findPost(id);
  if (!post) return;

  // 进入编辑态前先确认当前没有其他卡片在编辑（重绘即可退出旧编辑态）
  cardEl.querySelector('.post-content').outerHTML =
    '<div class="edit-area">' +
    '  <textarea class="edit-input" maxlength="' + MAX_CONTENT + '">' +
    escapeHtml(post.content) +
    '  </textarea>' +
    '  <div class="edit-actions">' +
    '    <button class="btn btn-ghost btn-sm cancel-edit">取消</button>' +
    '    <button class="btn btn-primary btn-sm confirm-edit">保存</button>' +
    '  </div>' +
    '</div>';

  const input = cardEl.querySelector('.edit-input');
  input.focus();
  // 光标移到末尾
  input.selectionStart = input.selectionEnd = input.value.length;

  cardEl.querySelector('.confirm-edit').addEventListener('click', function () {
    const newContent = input.value.trim();
    if (!newContent) {
      alert('内容不能为空。');
      return;
    }
    post.content = newContent;
    save();
    render();
  });

  cardEl.querySelector('.cancel-edit').addEventListener('click', function () {
    render(); // 直接重绘即回到普通展示态
  });
}

// 删除单条日志（原生 confirm 确认，最小可用原则）
function removePost(id) {
  const post = findPost(id);
  if (!post) return;
  const name = post.title ? '「' + post.title + '」' : '这条日志';
  if (!confirm('确定要删除' + name + '吗？')) return;

  posts = posts.filter((p) => p.id !== id);
  save();
  render();
}

// 清空全部日志
function clearAll() {
  if (posts.length === 0) {
    alert('当前没有日志，无需清空。');
    return;
  }
  if (!confirm('确定要清空全部 ' + posts.length + ' 条日志吗？此操作不可恢复！')) return;

  posts = [];
  save();
  render();
}

/* ============================================================
   发布区状态：字数统计 + 按钮禁用态
   ============================================================ */

function updateComposerState() {
  const len = contentInput.value.trim().length;
  charCount.textContent = contentInput.value.length + ' / ' + MAX_CONTENT;
  publishBtn.disabled = len === 0;
}

/* ============================================================
   事件绑定
   ============================================================ */

// 发布按钮 & 快捷键（Ctrl/Cmd + Enter 发布）
publishBtn.addEventListener('click', publish);
contentInput.addEventListener('input', updateComposerState);
contentInput.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') publish();
});

// 清空按钮
clearBtn.addEventListener('click', clearAll);

// 列表区域使用事件委托：一处监听，处理所有卡片的编辑/删除点击
postList.addEventListener('click', function (e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const cardEl = e.target.closest('.post-card');
  if (!cardEl) return;
  const id = Number(btn.dataset.id);

  if (btn.classList.contains('edit')) startEdit(id, cardEl);
  if (btn.classList.contains('del')) removePost(id);
});

/* ============================================================
   启动：读取数据 → 绑定完成 → 首次渲染
   ============================================================ */
load();
updateComposerState();
render();
