import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**", "components/**", "app/**"],
      exclude: [
        "app/api/**",
        "app/layout.tsx",
        "app/page.tsx",
        "app/booking/**",
        "components/ui/**",
        "**/*.test.*",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
