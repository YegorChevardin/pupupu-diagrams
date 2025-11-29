<script setup lang="ts">
import DiagramCanvas from './components/DiagramCanvas.vue'
import Toolbar from './components/Toolbar.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Easy UML</h1>
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
}

.app-header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #34495e;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-main {
  flex: 1;
  overflow: hidden;
}
</style>
