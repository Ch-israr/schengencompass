import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The date engine and serialisation are pure Node code; no browser needed.
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
