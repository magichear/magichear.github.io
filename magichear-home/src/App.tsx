import { useEffect, useRef, useState, useCallback } from "react";
import SearchBox from "./components/SearchBox";
import { navigationLinks, socialLinks } from "./data/links";
import { decryptEmail } from "./utils/decryptEmail";
import fallbackImages from "./data/images.json";

/** 一言默认文本 */
const DEFAULT_HITOKOTO = {
  text: "你若林间溪水，萦绕白杨良辰。",
  from: "林若溪&杨辰",
};

function App() {
  const panelRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hitokoto, setHitokoto] = useState(DEFAULT_HITOKOTO);

  // ---- Bing 壁纸背景 ----
  useEffect(() => {
    const SESSION_KEY = "bing-image-index";
    const MAX_INDEX = 7;

    /** 根据图片 URL 列表设置背景 */
    const applyBackground = (imgUrls: string[]) => {
      let index = Number(sessionStorage.getItem(SESSION_KEY));
      if (isNaN(index) || index >= MAX_INDEX) index = 0;
      else index++;

      const url = "https://www.cn.bing.com" + imgUrls[index];
      if (panelRef.current) {
        panelRef.current.style.background = `url('${url}') center center no-repeat #666`;
        panelRef.current.style.backgroundSize = "cover";
      }
      sessionStorage.setItem(SESSION_KEY, String(index));
    };

    // 优先从服务器获取最新数据；file:// 协议或离线时回退到构建时内联的数据
    fetch("./images.json")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((urls: string[]) => applyBackground(urls))
      .catch(() => applyBackground(fallbackImages));
  }, []);

  // ---- 一言 API ----
  useEffect(() => {
    fetch("https://v1.hitokoto.cn")
      .then((res) => res.json())
      .then((data) => {
        setHitokoto({ text: data.hitokoto, from: data.from });
      })
      .catch(() => {
        // 请求失败时保持默认文本
      });
  }, []);

  // ---- iUp 渐入动画（交错 150ms） ----
  useEffect(() => {
    let time = 0;
    const DURATION = 150;
    document.querySelectorAll(".iUp").forEach((el) => {
      setTimeout(() => el.classList.add("up"), time);
      time += DURATION;
    });
  }, []);

  // ---- 头像加载完成 ----
  const handleAvatarLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.classList.add("show");
    },
    []
  );

  // ---- 移动端菜单切换 ----
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {/* 移动端菜单按钮 */}
      <span className="mobile btn-mobile-menu" onClick={toggleMenu}>
        <i
          className={`social iconfont ${
            menuOpen ? "icon-angleup animated fadeIn" : "icon-list"
          } btn-mobile-menu__icon`}
        />
        <i className="social iconfont icon-angleup btn-mobile-close__icon hidden" />
      </span>

      {/* 主面板 */}
      <header id="panel" className="panel-cover" ref={panelRef}>
        <div className="panel-main">
          <div className="panel-main__inner panel-inverted">
            <div className="panel-main__content">
              {/* 搜索框 */}
              <SearchBox />

              {/* 头像（3D 翻转效果） */}
              <div className="ih-item circle effect right_to_left">
                <a href="#" title="" className="blog-button">
                  <div className="img">
                    <img
                      src="https://unpkg.com/klevenna-image@2.0.1/logo/l1.jpg"
                      alt="img"
                      className="js-avatar iUp profilepic"
                      onLoad={handleAvatarLoad}
                    />
                  </div>
                  <div className="info iUp">
                    <div className="info-back">
                      <h2>Fighting</h2>
                      <p>2026 · 突破</p>
                    </div>
                  </div>
                </a>
              </div>

              {/* 标题 */}
              <h1 className="panel-cover__title panel-title iUp">
                <a href="#" title="magichear Home">
                  magichear
                </a>
              </h1>

              {/* 副标题 */}
              <p className="panel-cover__subtitle panel-subtitle iUp">
                且莫空山听雨去
              </p>

              <hr className="panel-cover__divider iUp" />

              {/* 一言 */}
              <p id="description" className="panel-cover__description iUp">
                {hitokoto.text}
                <br />
                -「<strong>{hitokoto.from}</strong>」
              </p>

              {/* 导航区域 */}
              <div
                className={`navigation-wrapper iUp ${
                  menuOpen ? "visible animated bounceInDown" : ""
                }`}
              >
                {/* 主导航 */}
                <div>
                  <nav className="cover-navigation cover-navigation--primary">
                    <ul className="navigation">
                      {navigationLinks.map((link, i) => (
                        <li key={i} className="navigation__item">
                          <a
                            href={link.href}
                            className="blog-button"
                            {...(link.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* 社交图标 */}
                <div className="iUp">
                  <nav className="cover-navigation navigation--social">
                    <ul className="navigation">
                      {socialLinks.map((link, i) => (
                        <li key={i} className="navigation__item">
                          <a
                            href={link.isEmail ? "#" : link.href}
                            title={link.title}
                            {...(!link.isEmail
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                            onClick={
                              link.isEmail
                                ? (e) => {
                                    e.preventDefault();
                                    decryptEmail(link.href);
                                  }
                                : undefined
                            }
                          >
                            <i className={`social iconfont ${link.icon}`} />
                            <span className="label">{link.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-cover--overlay cover-slate" />
        </div>

        {/* 底部备注 */}
        <div className="remark iUp">
          <p className="power">
            Powered By{" "}
            <a
              href="https://github.com/features/actions"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Actions
            </a>{" "}
            And{" "}
            <a
              href="https://hitokoto.cn/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hitokoto
            </a>
          </p>
        </div>
      </header>
    </>
  );
}

export default App;
