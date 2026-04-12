<template>
  <header class="app-header glass-card">
    <div class="brand">
      <div class="brand-icon">🚲</div>
      <span class="brand-text">SmartCycle Navigator</span>
    </div>

    <nav class="nav-links">
      <a href="#" class="active">Home</a>
      <a href="#">Map</a>
      <a href="#">Routes</a>
      <a href="#">Safety Insights</a>
    </nav>

    <div class="header-actions">
      <button class="icon-btn" type="button">🔔</button>
      <div class="avatar">👨</div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(56, 102, 185, 0.95), rgba(63, 115, 198, 0.88));
  color: white;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.brand-text {
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.nav-links a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.92rem;
}

.nav-links a.active {
  color: white;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-btn,
.avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.icon-btn {
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: white;
}

.avatar {
  background: rgba(255, 255, 255, 0.9);
  color: #3567bc;
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .brand,
  .header-actions,
  .nav-links {
    justify-content: center;
  }
}
</style>