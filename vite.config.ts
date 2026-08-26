import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const SERVER_ONLY_PROVIDER_SDKS = ['openai', '@anthropic-ai/sdk', '@google/genai']

const config = defineConfig({
  ssr: {
    // These provider SDKs are only ever imported from server-only modules
    // (src/server/**) and are present in node_modules at runtime on Netlify
    // Functions. Keeping them external avoids Rollup trying to statically
    // bundle them into the SSR output.
    external: SERVER_ONLY_PROVIDER_SDKS,
  },
  build: {
    // Vite 7's environment-based build pipeline doesn't always route the SSR
    // build through `ssr.external` before Rollup resolves imports, so also
    // declare these as external directly on the Rollup build options.
    rollupOptions: {
      external: SERVER_ONLY_PROVIDER_SDKS,
    },
  },
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    netlify(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
