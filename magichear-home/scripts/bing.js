/**
 * 获取 Bing 每日壁纸 URL 并输出为纯 JSON 数组
 * 由 GitHub Action (.github/workflows/auto-bing.yml) 定时调用
 *
 * 用法：node assets/js/bing.js
 * 输出：./images.json
 */
const https = require("https");
const fs = require("fs");

const options = {
  hostname: "www.bing.com",
  port: 443,
  path: "/HPImageArchive.aspx?format=js&idx=0&n=8",
  method: "GET",
};

const req = https.request(options, (res) => {
  const chunks = [];
  res.on("data", (chunk) => chunks.push(chunk));
  res.on("end", () => {
    const body = Buffer.concat(chunks).toString();
    const data = JSON.parse(body);
    const urls = data.images.map((img) => img.url);
    const json = JSON.stringify(urls, null, 2);
    fs.writeFileSync("./images.json", json + "\n");
    console.log("✔ images.json updated:", urls.length, "images");
  });
});

req.on("error", (err) => {
  console.error("✘ Failed to fetch Bing images:", err.message);
  process.exit(1);
});

req.end();
