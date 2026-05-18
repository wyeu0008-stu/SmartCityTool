<template>
  <div class="accessibility-menu" aria-label="Accessibility tools">
    <button
      type="button"
      class="accessibility-trigger"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      aria-label="Open accessibility options"
      @click="menuOpen = !menuOpen"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="4" r="2.1"></circle>
        <path d="M4.5 8.2h15"></path>
        <path d="M12 8.5v5.2"></path>
        <path d="M8.4 21l2-6.5"></path>
        <path d="M15.6 21l-2-6.5"></path>
      </svg>
    </button>

    <div v-if="menuOpen" class="accessibility-panel" role="menu">
      <p>Accessibility</p>
      <span>WCAG support for older adults, children, keyboard users, and screen readers.</span>

      <button
        type="button"
        role="menuitemcheckbox"
        :aria-pressed="settings.largeText"
        :aria-checked="settings.largeText"
        @click="toggleSetting('largeText')"
      >
        Larger Text
      </button>
      <button
        type="button"
        role="menuitemcheckbox"
        :aria-pressed="settings.highContrast"
        :aria-checked="settings.highContrast"
        @click="toggleSetting('highContrast')"
      >
        High Contrast
      </button>
      <button
        type="button"
        role="menuitemcheckbox"
        :aria-pressed="settings.reducedMotion"
        :aria-checked="settings.reducedMotion"
        @click="toggleSetting('reducedMotion')"
      >
        Reduce Motion
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'

const STORAGE_KEY = 'smartcycle-accessibility-settings'

const settings = reactive({
  largeText: false,
  highContrast: false,
  reducedMotion: false
})
const menuOpen = ref(false)

function applySettings() {
  const root = document.documentElement

  root.classList.toggle('a11y-large-text', settings.largeText)
  root.classList.toggle('a11y-high-contrast', settings.highContrast)
  root.classList.toggle('a11y-reduced-motion', settings.reducedMotion)
}

function toggleSetting(key) {
  settings[key] = !settings[key]
}

onMounted(() => {
  try {
    const savedSettings = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    Object.assign(settings, {
      largeText: Boolean(savedSettings.largeText),
      highContrast: Boolean(savedSettings.highContrast),
      reducedMotion: Boolean(savedSettings.reducedMotion)
    })
  } catch {
    applySettings()
  }

  applySettings()
})

watch(settings, () => {
  applySettings()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
})
</script>

<style scoped>
.accessibility-menu {
  position: relative;
  flex: 0 0 auto;
}

.accessibility-trigger {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 2px solid rgba(255, 255, 255, 0.58);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 900;
}

.accessibility-trigger svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

.accessibility-trigger:hover,
.accessibility-trigger[aria-expanded="true"] {
  background: #ffffff;
  color: #0066cc;
}

.accessibility-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 60;
  display: grid;
  gap: 10px;
  width: min(290px, calc(100vw - 32px));
  padding: 16px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
  color: #1d1d1f;
}

.accessibility-panel p,
.accessibility-panel span {
  margin: 0;
}

.accessibility-panel p {
  font-size: 0.95rem;
  font-weight: 900;
}

.accessibility-panel span {
  color: #5f6368;
  font-size: 0.86rem;
  line-height: 1.35;
}

.accessibility-panel button {
  min-width: 44px;
  min-height: 44px;
  padding: 10px 14px;
  border: 2px solid rgba(0, 113, 227, 0.24);
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.08);
  color: #005bbd;
  cursor: pointer;
  font-weight: 900;
  text-align: left;
}

.accessibility-panel button[aria-pressed="true"] {
  border-color: #0071e3;
  background: #0071e3;
  color: #ffffff;
}

@media (max-width: 820px) {
  .accessibility-panel {
    right: auto;
    left: 0;
  }
}
</style>
