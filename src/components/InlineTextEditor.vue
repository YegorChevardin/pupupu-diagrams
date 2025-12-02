<template>
  <div
    v-if="visible"
    class="inline-text-editor"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      fontSize: fontSize + 'px',
      width: width + 'px',
      minWidth: minWidth + 'px'
    }"
  >
    <textarea
      ref="textInput"
      v-model="localText"
      class="text-input"
      :style="{
        fontSize: fontSize + 'px',
        textAlign: textAlign
      }"
      @blur="handleFinish"
      @keydown="handleKeyDown"
      @input="adjustSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface Props {
  visible: boolean
  position: { x: number; y: number }
  text: string
  fontSize: number
  textAlign?: 'left' | 'center' | 'right'
  minWidth?: number
}

interface Emits {
  (e: 'update:text', text: string): void
  (e: 'finish'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  textAlign: 'left',
  minWidth: 100
})

const emit = defineEmits<Emits>()

const textInput = ref<HTMLTextAreaElement>()
const localText = ref(props.text)
const width = ref(props.minWidth)

const adjustSize = () => {
  if (!textInput.value) return
  
  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'absolute'
  tempDiv.style.visibility = 'hidden'
  tempDiv.style.fontSize = props.fontSize + 'px'
  tempDiv.style.fontFamily = textInput.value.style.fontFamily || 'inherit'
  tempDiv.style.whiteSpace = 'pre'
  tempDiv.textContent = localText.value || 'W'
  document.body.appendChild(tempDiv)
  
  const textWidth = tempDiv.offsetWidth
  document.body.removeChild(tempDiv)
  
  width.value = Math.max(props.minWidth, textWidth + 20)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleFinish()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
  }
}

const handleFinish = () => {
  emit('update:text', localText.value)
  emit('finish')
}

watch(() => props.text, (newText) => {
  localText.value = newText
})

watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      if (textInput.value) {
        textInput.value.focus()
        textInput.value.select()
        adjustSize()
      }
    })
  }
})

onMounted(() => {
  adjustSize()
})

watch(localText, () => {
  adjustSize()
})
</script>

<style scoped>
.inline-text-editor {
  position: absolute;
  z-index: 1001;
  pointer-events: auto;
}

.text-input {
  border: 2px solid #667eea;
  border-radius: 6px;
  padding: 6px 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  outline: none;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  resize: none;
  overflow: hidden;
  line-height: 1.2;
  min-height: 1.2em;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:global(.dark) .text-input {
  background: rgba(30, 41, 59, 0.98);
  border-color: #818cf8;
  color: #e2e8f0;
  box-shadow: 0 4px 16px rgba(129, 140, 248, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
}

.text-input:focus {
  border-color: #764ba2;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4), 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:global(.dark) .text-input:focus {
  border-color: #a78bfa;
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5), 0 0 0 3px rgba(129, 140, 248, 0.2);
}
</style>