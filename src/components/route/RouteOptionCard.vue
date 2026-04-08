<template>
  color: #496990;
  font-weight: 700;
}

.mini-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
}

.green-badge {
  background: #dcf5e6;
}

.yellow-badge {
  background: #fff2cb;
}

.route-body {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.score-box {
  min-width: 64px;
  text-align: center;
  padding: 9px 12px;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
}

.score-box.green {
  background: linear-gradient(180deg, #56b98a, #399f70);
}

.score-box.blue {
  background: linear-gradient(180deg, #6295f2, #4c7dd8);
}

.score-box.teal {
  background: linear-gradient(180deg, #57b8c7, #429aa7);
}

.route-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  color: #6480a5;
  font-size: 0.9rem;
}

.risk-text.low {
  color: #50ad63;
}

.risk-text.medium {
  color: #dea32e;
}

.risk-text.high {
  color: #e06b6b;
}

.full-width {
  width: 100%;
}
</style>