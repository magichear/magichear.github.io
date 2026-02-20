[![Version](https://img.shields.io/github/package-json/v/dmego/home.github.io)](https://www.npmjs.com/package/dmego-home-page)
[![Website](https://img.shields.io/website-up-down-green-red/http/i.dmego.cn.svg)](http://i.dmego.cn/)
[![License](https://img.shields.io/github/license/dmego/home.github.io.svg)](/LICENSE)
[![Say Thanks](https://img.shields.io/badge/Say-Thanks!-1EAEDB.svg)](https://saythanks.io/to/dmego)

### 个人主页

> 这是我的[个人主页](http://magichear.github.io/)

> 改编自：[个人主页](http://i.dmego.cn/)

> 衍生自 [Vno](https://github.com/onevcat/vno-jekyll) Jekyll 主题

> 页面部分加载效果借鉴于 [Mno](https://github.com/mcc108/mno) Ghost 主题

> 借鉴了[北岛向南的小屋](https://javef.github.io/)的头像样式

> 使用了[全国高校校徽图标字体库](https://github.com/lovefc/china_school_badge)中的ustc字体

### 注

- 使用了 [一言](http://hitokoto.cn/) 的 API 服务
- ~~使用了 [Bing 壁纸 API](https://github.com/xCss/bing/) 服务~~
- ~~使用了 [Yahoo Query Language (YQL)](https://developer.yahoo.com/yql/) 来解决获取 Bing 壁纸跨域问题~~
- ~~原先 YQL 服务将被淘汰，现改用 [JsonBird](https://bird.ioliu.cn/)~~
- 使用 `GitHub Action` 来获取 Bing 壁纸，使用 `JSONP` 获取 Bing 壁纸 URL 文件

### 更新记录

- 2022-06-10
  - 发布 NPM 包，使用 UNPKG 作为资源文件的 CDN
- 2023-02-27
  - 添加《GitHub Action 配置详细步骤》文档
- 2023-04-12
  - 移除 Jquery 依赖，使用原生 JS
- 2023-08-28
  - 将壁纸地址换成 cn.bing.com

---

- 2023-09-28
  - 开始学习并改编网站
- 2023-10-11

  - 完成网站改编
  - 修改了部分资源并发布了新的 npm 包

- 2024-06-08
  - 加入搜索框功能，v2.0.0 大版本正式上线
    - `https://unpkg.com/klevenna-image@2.0.2/.......`
  - 开始作为我的浏览器首页/导航页
  - 搜索框使用资源：
    - ~~`./assets/css/search-box.css`~~
      - `magichear-home\src\styles\search-box.css`
    - ~~`./assets/js/search-box.js`~~
      - `magichear-home\src\components\SearchBox.tsx`

---

- 2026-02-20
  - 使用vite6-react-ts完成项目重写，呈现效果基本保持一致
  - 集成 USTC 校徽字体水印（头像翻转卡片背面）
    - 子集化自 [全国高校校徽图标字体库](https://github.com/lovefc/china_school_badge)（Apache-2.0）
    - 仅保留 `.fc-icon-ustc`（U+E025）单个字形，woff2 ≈ 4 KB

### 更新计划

~~- 2024-06-08~~
~~  - 有想法将背景替换为动态~~
~~    - 目前尚未找到合适的源~~
~~      - Bing 的壁纸会经常更新，但都是静态的~~
~~    - 暂无合适的替换思路~~
~~  - 希望为搜索框添加自由更换搜索引擎的功能~~
~~    - 暂时没想到怎么在不影响美观的情况下触发事件~~

随缘，毕业了，不干前端