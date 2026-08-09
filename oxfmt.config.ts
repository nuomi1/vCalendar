import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [".agents/skills", ".claude/skills", ".opencode/skills"],
  sortImports: true,
  sortPackageJson: {
    sortScripts: true,
  },
  sortTailwindcss: true,
});
