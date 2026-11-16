export interface WindowListenerBinding<T extends Event = Event> {
  capture?: boolean
  handler: (event: T) => void
  once?: boolean
  type: string
}

export function bindWindowListeners(bindings: WindowListenerBinding[]): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  for (const { type, handler, capture, once } of bindings) {
    window.addEventListener(type, handler, { capture, once })
  }

  return () => {
    for (const { type, handler, capture } of bindings) {
      window.removeEventListener(type, handler, capture)
    }
  }
}
