import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 原始站点样式（顺序与原 HTML 中 <link> 标签一致）
import "./styles/onlinewebfonts.css";
import "./styles/vno.css";
import "./styles/iconfont.css";
import "./styles/search-box.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
