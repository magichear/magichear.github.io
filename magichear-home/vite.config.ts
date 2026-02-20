import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve, dirname } from "node:path";
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * 自定义插件：构建完成后向 dist 复制 GitHub Pages 部署所需的额外文件
 *  - .github/workflows  （Bing 壁纸定时更新 Action）
 *  - assets/js/bing.js  （Action 调用的 Node 脚本）
 *  - CNAME / 404.html / favicon / apple-touch-icon 等
 */
function copyGitHubPagesFiles(): Plugin {
  return {
    name: "copy-github-pages-files",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      const origin = resolve(
        __dirname,
        "originCode/magichear.github.io"
      );
      const deploy = resolve(__dirname, "deploy");

      // .github 目录（含 workflows/auto-bing.yml）—— 使用 deploy 目录下的更新版本
      cpSync(resolve(deploy, ".github"), resolve(dist, ".github"), {
        recursive: true,
      });

      // GitHub Action 调用的 bing.js（已改写为输出纯 JSON）
      cpSync(
        resolve(__dirname, "scripts/bing.js"),
        resolve(dist, "assets/js/bing.js"),
        { recursive: true }
      );

      // CNAME
      if (existsSync(resolve(origin, "CNAME"))) {
        cpSync(resolve(origin, "CNAME"), resolve(dist, "CNAME"));
      }

      // 404.html → 复用 index.html（SPA 回退）
      cpSync(resolve(dist, "index.html"), resolve(dist, "404.html"));

      console.log("✔ GitHub Pages 额外文件已复制到 dist/");
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile(), copyGitHubPagesFiles()],
  build: {
    // 内联所有资源以便 HTML 可独立打开
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
  },
});
