// Composable para usar capjs en componentes Vue
import { ref } from 'vue'


export function useCapjs(options = {}) {
  const captcha = ref(null)
  const answer = ref('')

  function generate() {
    if (!window.capjs) {
      setTimeout(generate, 100)
      return
    }
    const cap = window.capjs.cap || window.capjs
    const result = cap({
      ...options,
      fontSize: 36,
      length: 5,
      noise: 2,
      width: 160,
      height: 48,
    })
    captcha.value = result
    answer.value = ''
  }

  // Llama al generar al montar
  generate()

  return {
    captcha,
    answer,
    generate,
    validate: (input) => input === captcha.value.text,
  }
}
