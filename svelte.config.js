import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Övningar och vyer byggs om för varje fråga ({#key}), så props läses avsiktligt bara en gång.
    warningFilter: (w) => w.code !== 'state_referenced_locally',
  },
}
