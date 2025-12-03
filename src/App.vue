<script setup lang="ts">
import { onMounted } from 'vue'
import DiagramCanvas from './components/DiagramCanvas.vue'
import Toolbar from './components/Toolbar.vue'
import { useTheme } from './composables/useTheme'
import { useDiagramStore } from './stores/diagram'
import { decodeDiagramFromUrl, clearUrlHash } from './utils/urlSharing'

const { loadTheme } = useTheme()
const diagramStore = useDiagramStore()

onMounted(() => {
  loadTheme()
  
  const urlDiagram = decodeDiagramFromUrl()
  if (urlDiagram) {
    diagramStore.loadDiagram(urlDiagram)
    clearUrlHash()
  }
})
</script>

<template>
  <div class="app">
    <main class="app-main">
      <DiagramCanvas />
    </main>
    <header class="app-header">
      <Toolbar />
    </header>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
}

.app-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.app-header > * {
  pointer-events: auto;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 12px 16px;
  }
}

.app-main {
  width: 100%;
  height: 100%;
}
</style>

