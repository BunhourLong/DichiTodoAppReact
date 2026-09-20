/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    // Testing Library drives real DOM nodes, so the tests need a DOM.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Tests live next to the thing they test, not in a parallel tree.
    include: ['src/**/*.test.{ts,tsx}'],
    // No `globals: true`. `describe` / `it` / `expect` are imported in every
    // file like anything else, so nothing is magic and the types come along
    // with the import.
    globals: false,
    // Tailwind's stylesheet has no bearing on what a query finds; skipping it
    // takes seconds off the run.
    css: false,
  },
})
