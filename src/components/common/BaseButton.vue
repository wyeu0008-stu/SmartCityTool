<template>
  <button
    class="base-button"
    :class="variant"
    :type="type"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.base-button {
  border: none;
  border-radius: 12px;
  min-height: 44px;
  padding: 0 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.base-button:hover:enabled {
  transform: translateY(-1px);
}

.base-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.base-button.primary {
  color: white;
  background: linear-gradient(90deg, #1e9cad, #6bc36d);
  box-shadow: 0 10px 20px rgba(63, 170, 118, 0.24);
}

.base-button.secondary {
  color: white;
  background: linear-gradient(180deg, #6ea5ff, #4b7fe0);
}

.base-button.ghost {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border-soft);
}
</style>