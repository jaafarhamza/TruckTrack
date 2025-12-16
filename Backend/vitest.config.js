import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test environment
    environment: "node",

    // Global test timeout (10 seconds)
    testTimeout: 10000,

    // Setup files to run before tests
    setupFiles: ["./tests/setup.js"],

    // Test file patterns
    include: ["tests/**/*.test.js"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "controllers/**/*.js",
        "services/**/*.js",
        "middlewares/**/*.js",
        "models/**/*.js",
      ],
      exclude: ["node_modules/**", "tests/**", "config/**", "utils/**"],
    },

    // Globals (optional, allows using describe/test without importing)
    globals: true,

    // Run tests sequentially to avoid database conflicts
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
