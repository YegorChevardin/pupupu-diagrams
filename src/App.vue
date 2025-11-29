<script setup lang="ts">
import DiagramCanvas from './components/DiagramCanvas.vue'
import Toolbar from './components/Toolbar.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <span class="app-title">PupupuDiagram</span>
      <Toolbar />
    </header>
    <main class="app-main">
      <DiagramCanvas />
    </main>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #fafafa;
}

.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e1e5e9;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 60px;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .app-header {
    padding: 8px 12px;
    min-height: 50px;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
    padding: 8px;
    gap: 8px;
  }
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 16px;
    text-align: center;
  }
}

.app-main {
  flex: 1;
  overflow: hidden;
  background: #ffffff;
}
</style>
