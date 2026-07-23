/// <reference types="vite/client" />

import type { TodoThingsApi } from '../electron/preload'

declare global {
  interface Window {
    todothings: TodoThingsApi
  }
}

export {}
