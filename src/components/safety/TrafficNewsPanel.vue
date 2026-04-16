<script setup>
defineProps({
  news: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  error: String
})

function getTag(title) {
  const t = title.toLowerCase()

  if (t.includes('accident') || t.includes('crash')) return 'accident'
  if (t.includes('policy') || t.includes('plan')) return 'policy'
  return 'general'
}
</script>

<template>
  <section class="news-panel glass-card">
    <div class="panel-header">
      <h2>Traffic & Cycling News</h2>
    </div>

    <p v-if="loading" class="status-text">Loading news...</p>
    <p v-else-if="error" class="status-text error">{{ error }}</p>

    <div v-else class="news-list">
      <article v-for="item in news" :key="item.url" class="news-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <div class="news-meta">
          <span>{{ item.source }}</span>
          <span>{{ item.publishedAt?.slice(0, 10) }}</span>
          <span class="tag" :class="getTag(item.title)">
  {{ getTag(item.title) }}
</span>
        </div>
        <a :href="item.url" target="_blank" rel="noreferrer">Read more</a>
      </article>
    </div>
  </section>
</template>



<style scoped>
.news-panel {
  padding: 24px;
  border-radius: 18px;
}

.panel-header h2 {
  margin: 0 0 18px;
  color: #274a87;
}

.news-list {
  display: grid;
  gap: 16px;
}

.news-card {
  padding: 20px;
  border-radius: 16px;

  background: linear-gradient(135deg, #ffffff, #f6f9fc);
  border: 1px solid #e4ebf3;

  transition: all 0.2s ease;
}

.news-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(60, 100, 180, 0.12);
}

.news-card h3 {
  color: #1f3f77;
  font-size: 1.05rem;
}

.news-card p {
  margin: 0 0 12px;
  color: #5e7698;
  line-height: 1.5;
}

.news-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  color: #7b8fa9;
  font-size: 0.9rem;
}

.status-text {
  color: #6982a3;
}

.status-text.error {
  color: #c34f4f;
}

.news-card a {
  display: inline-block;
  margin-top: 8px;
  color: #2f6f4f;
  font-weight: 600;
  text-decoration: none;
}

.news-card a:hover {
  text-decoration: underline;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 8px;
}

/* 分类颜色 */
.tag.accident {
  background: #ffe5e5;
  color: #c94a4a;
}

.tag.policy {
  background: #e5f0ff;
  color: #3b6fd8;
}

.tag.general {
  background: #eaf7ee;
  color: #2f6f4f;
}
</style>

