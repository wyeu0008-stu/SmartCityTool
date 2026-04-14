<template>
  <header class="app-header">
    <div class="brand">
      <img src="/cycling.png" alt="logo" class="logo" />
      <span class="brand-text">SmartCycle Navigator</span>
    </div>

    <nav class="nav-links">
      <a href="#" class="active">Home</a>
      <a href="#">Map</a>
      <a href="#">Routes</a>
      <a href="#">Safety Insights</a>
    </nav>

    <div class="header-actions">
      <button class="signin-btn">Sign In</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100vw;                 /* 🔥 force full viewport width */
  max-width: 100vw;
  margin-left: calc(50% - 50vw); /* 🔥 break out of centered container */
  margin-right: calc(50% - 50vw);

  padding: 18px 60px;

  background: #ffffff;
  border-bottom: 1px solid #e6edf5;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 80px;
}

.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: #1f2d3d;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 64px; /* 🔥 even more spacing */
  flex: 1;
  justify-content: center; /* 🔥 center the nav */
}

.nav-links a {
  text-decoration: none;
  color: #5a6b7b;
  font-size: 1.05rem;
  position: relative;
}

.nav-links a.active {
  color: #2f6f4f;
  font-weight: 700;
}

.nav-links a.active::after {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #2f6f4f;
  border-radius: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  margin-left: 80px;
}

.signin-btn {
  border: 1px solid #d0d7de;
  background: #ffffff;
  padding: 10px 18px;
  border-radius: 22px;
  font-size: 1rem;
  cursor: pointer;
}

.logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
  background: transparent;
  padding: 0;
}
</style>