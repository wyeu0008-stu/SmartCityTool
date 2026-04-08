<template>

      <div class="field-row">
        <span class="field-icon">📍</span>
        <input
          :value="destination"
          type="text"
          placeholder="Enter Destination"
          @input="$emit('update:destination', $event.target.value)"
        />
        <span class="field-arrow">⌄</span>
      </div>
    </div>

    <BaseButton class="full-width" :disabled="loading" variant="primary" @click="$emit('submit')">
      {{ loading ? 'Loading Routes...' : 'Find Safest Route' }}
    </BaseButton>
  </BaseCard>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'
import BaseCard from '../common/BaseCard.vue'

defineProps({
  currentLocation: {
    type: String,
    default: ''
  },
  destination: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:currentLocation', 'update:destination', 'submit'])
</script>

<style scoped>
.search-card {
  padding: 18px;
  margin-bottom: 26px;
}

.input-list {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 0 14px;
}

.field-row input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #3c5c8c;
  font-size: 0.98rem;
}

.field-icon,
.field-arrow {
  color: #6488c6;
}

.full-width {
  width: 100%;
}
</style>