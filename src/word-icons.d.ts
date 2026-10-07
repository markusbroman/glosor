declare module 'virtual:word-icons' {
  import type { Component } from 'svelte'
  const icons: Record<string, Component<{ size?: number | string; weight?: string; color?: string }>>
  export default icons
}
