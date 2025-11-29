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
  border: 2px solid #0078d4;
  border-radius: 4px;
  padding: 4px 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  outline: none;
  background: white;
  resize: none;
  overflow: hidden;
  line-height: 1.2;
  min-height: 1.2em;
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.2);
}

.text-input:focus {
  border-color: #005a9e;
  box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}
</style>