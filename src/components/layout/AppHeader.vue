<template>
  <header class="app-header">
    <div class="brand">
      <img src="/cycling.png" alt="logo" class="logo" />
      <span class="brand-text">SmartCycle Navigator</span>
    </div>


    <nav class="nav-links">
      <router-link to="/" active-class="active">Home</router-link>
      <router-link to="/map" active-class="active">Map</router-link>
      <router-link to="/routes" active-class="active">Routes</router-link>
      <router-link to="/insights" active-class="active">Safety Insights</router-link>
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

  width: 100vw;                
  max-width: 100vw;
  margin-left: calc(50% - 50vw); 
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
  gap: 64px;
  flex: 1;
  justify-content: center;
  margin-left: -160px;   /* shift nav slightly to the left */
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