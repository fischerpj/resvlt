// ============================================================
// File: components/refstore.js
// (Canonical shared store — SINGLETON across all components)

console.log("loading refstore.js ONLY ONCE but in each Svelte component")

// ============================================================
// store.js — Global Singleton Store via window.myRefShare
// ============================================================

import { writable } from 'svelte/store'
import { RefAccumulator } from './refclass.js'

// Create global namespace if missing
if (!window.myRefShare) {
  window.myRefShare = {}
}

// Create the singleton instance ONCE
if (!window.myRefShare.accuInstance) {
  window.myRefShare.accuInstance = new RefAccumulator()
}

// Create the Svelte store ONCE
if (!window.myRefShare.accuStore) {
  window.myRefShare.accuStore = writable(window.myRefShare.accuInstance)
}

// Export the shared store
export const RefAccu = window.myRefShare.accuStore

// Update helpers

export function setValue(x) {
  RefAccu.update(acc => {
    acc.reset()
    acc.add(x)
    return acc
  })
}

export function addValue(x) {
  RefAccu.update(acc => {
    acc.add(x)
    return acc
  })
}

export function resetRefAccu() {
  RefAccu.update(acc => {
    acc.reset()
    return acc
  })
}
