<template>
  <div class="page-container">
    <section class="hero-section">
      <h1 class="hero-title">Safety Insights</h1>
      <p class="hero-subtitle">
        Explore cycling safety risks, hazard patterns, and route safety recommendations.
      </p>
    </section>

    <section class="content-card">
      <h2>Overview</h2>
      <p>This is the Safety Insights page.</p>
    </section>
  </div>
</template>

<style scoped>
.page-container {
  padding: 32px 24px;
}

.hero-section {
  text-align: center;
  padding: 24px 16px 32px;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #274a87;
}

.hero-subtitle {
  margin-top: 14px;
  color: #4c6692;
  line-height: 1.6;
  font-size: 1.05rem;
}

.content-card {
  padding: 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e4ebf3;
}
</style>