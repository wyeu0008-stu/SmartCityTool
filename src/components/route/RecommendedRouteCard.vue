<template>
  color: #2f9b81;
  font-size: 2rem;
  font-weight: 800;
}

.score-value span {
  font-size: 1rem;
  color: #8ba3c2;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e4ebf8;
  overflow: hidden;
  margin: 12px 0 18px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ea7d8, #6ec278);
}

.summary-box {
  background: rgba(236, 245, 255, 0.9);
  border-radius: 14px;
  padding: 14px;
}

.summary-title {
  color: #607ca4;
  font-weight: 700;
  margin-bottom: 10px;
}

.summary-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.92rem;
}

.pill.strong {
  background: #36a878;
  color: white;
}

.pill.neutral {
  background: #e7f0fd;
  color: #4a6a98;
}

.pill.soft {
  background: #edf8ec;
  color: #58a25a;
}

@media (max-width: 900px) {
  .recommended-card {
    grid-template-columns: 1fr;
  }
}
</style>