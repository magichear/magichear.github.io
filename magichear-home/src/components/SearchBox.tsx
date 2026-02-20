import { useRef, useState, useCallback, useEffect } from "react";

/* ─── 搜索引擎定义 ─── */
interface SearchEngine {
  id: string;
  label: string;
  action: string;
  paramName: string;
  color: string;
  letter: string;
}

const ENGINES: SearchEngine[] = [
  {
    id: "yandex",
    label: "Yandex",
    action: "https://yandex.com/search",
    paramName: "text",
    color: "#FF0000",
    letter: "Y",
  },
  {
    id: "bing",
    label: "Bing",
    action: "https://cn.bing.com/search",
    paramName: "q",
    color: "#00809D",
    letter: "B",
  },
  {
    id: "google",
    label: "Google",
    action: "https://www.google.com/search",
    paramName: "q",
    color: "#4285F4",
    letter: "G",
  },
];

const STORAGE_KEY = "preferred-search-engine";

/* ─── JSONP 辅助（绕过 CORS） ─── */
function jsonpFetch(rawUrl: string, timeout = 4000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const cb = `__sg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      settled = true;
      delete (window as any)[cb];
      if (script.parentNode) script.remove();
    };

    (window as any)[cb] = (data: unknown) => {
      if (settled) return;
      cleanup();
      resolve(data);
    };

    script.src = rawUrl.replace("__CB__", cb);
    script.onerror = () => {
      cleanup();
      reject(new Error("jsonp-error"));
    };
    document.head.appendChild(script);

    setTimeout(() => {
      if (!settled) {
        cleanup();
        reject(new Error("jsonp-timeout"));
      }
    }, timeout);
  });
}

/* ─── 每引擎的 JSONP 建议配置 ─── */
interface SuggestConfig {
  url: string;
  parse: (data: unknown) => string[];
}

/** Google gws-wiz 格式: ["q",[["s1",r,[t],...],...],...] */
const parseGws = (data: unknown): string[] => {
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1]
    .map((item: unknown) => (Array.isArray(item) ? String(item[0]) : ""))
    .filter(Boolean)
    .slice(0, 8);
};

/** OpenSearch JSON 格式: ["q",["s1","s2",...]] */
const parseOpenSearch = (data: unknown): string[] => {
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1].map(String).slice(0, 8);
};

function buildSuggestConfig(
  engine: SearchEngine,
  query: string
): SuggestConfig {
  const q = encodeURIComponent(query);
  switch (engine.id) {
    case "bing":
      return {
        url: `https://api.bing.com/osjson.aspx?query=${q}&JsonType=callback&JsonCallback=__CB__`,
        parse: parseOpenSearch,
      };
    case "google":
      return {
        url: `https://www.google.com/complete/search?q=${q}&client=gws-wiz&callback=__CB__`,
        parse: parseGws,
      };
    case "yandex":
    default:
      // Yandex suggest 不支持 JSONP，复用 Google 建议
      return {
        url: `https://www.google.com/complete/search?q=${q}&client=gws-wiz&callback=__CB__`,
        parse: parseGws,
      };
  }
}

interface SearchBoxProps {
  className?: string;
}

/** 多源搜索框组件 */
export default function SearchBox({ className = "" }: SearchBoxProps) {
  /* ── state ── */
  const [query, setQuery] = useState("");
  const [engineIdx, setEngineIdx] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const i = ENGINES.findIndex((e) => e.id === saved);
    return i >= 0 ? i : 0;
  });
  const [engineOpen, setEngineOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestVisible, setSuggestVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  /* ── refs ── */
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const requestIdRef = useRef(0);

  const engine = ENGINES[engineIdx];
  /* 仅在有实际输入内容时才激活背景（不含单纯聚焦） */
  const isActive = query.length > 0;
  const hasSuggestions = suggestVisible && suggestions.length > 0;

  /* ── 点击外部关闭 ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEngineOpen(false);
        setSuggestVisible(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── 搜索建议 (debounce + JSONP) ── */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSuggestVisible(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const id = ++requestIdRef.current;
      const config = buildSuggestConfig(engine, query);

      jsonpFetch(config.url)
        .then((data) => {
          if (requestIdRef.current !== id) return; // 过期请求，丢弃
          const results = config.parse(data);
          setSuggestions(results);
          setSuggestVisible(results.length > 0);
          setActiveIdx(-1);
        })
        .catch(() => {
          /* JSONP 失败 — 静默降级 */
        });
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, engine]);

  /* ── handlers ── */
  const handleClear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setSuggestVisible(false);
    inputRef.current?.focus();
  }, []);

  const selectEngine = useCallback((idx: number) => {
    setEngineIdx(idx);
    localStorage.setItem(STORAGE_KEY, ENGINES[idx].id);
    setEngineOpen(false);
    setSuggestions([]);
    setSuggestVisible(false);
    inputRef.current?.focus();
  }, []);

  const navigateToSearch = useCallback(
    (q: string) => {
      window.location.href = `${engine.action}?${engine.paramName}=${encodeURIComponent(q)}`;
    },
    [engine]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setSuggestVisible(false);
        setEngineOpen(false);
        setActiveIdx(-1);
        return;
      }
      if (!suggestVisible || suggestions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((p) => (p < suggestions.length - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((p) => (p > 0 ? p - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        navigateToSearch(suggestions[activeIdx]);
      }
    },
    [suggestVisible, suggestions, activeIdx, navigateToSearch]
  );

  /* ── render ── */
  return (
    <div
      ref={containerRef}
      className={[
        "search-box-component",
        isActive && "search-box--active",
        hasSuggestions && "search-box--has-suggestions",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── 搜索表单 ── */}
      <form
        action={engine.action}
        method="get"
        target="_self"
        className="search-form"
      >
        {/* 引擎选择按钮 */}
        <div
          className="engine-selector"
          onClick={() => {
            setEngineOpen((v) => !v);
            setSuggestVisible(false);
          }}
        >
          <span className="engine-letter" style={{ color: engine.color }}>
            {engine.letter}
          </span>
          <span className="engine-arrow">{engineOpen ? "▴" : "▾"}</span>
        </div>

        {/* 输入区域 */}
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            name={engine.paramName}
            placeholder="搜索..."
            autoFocus
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setEngineOpen(false);
              if (e.target.value) setSuggestVisible(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0 && query.trim()) setSuggestVisible(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {query.length > 0 && (
            <span className="clear-btn" onClick={handleClear}>
              ✕
            </span>
          )}
        </div>

        {/* 搜索按钮 */}
        <button type="submit" className="search-btn" aria-label="搜索">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {/* ── 引擎下拉菜单 ── */}
      {engineOpen && (
        <div className="engine-dropdown">
          {ENGINES.map((eng, i) => (
            <div
              key={eng.id}
              className={`engine-option ${i === engineIdx ? "engine-option--active" : ""}`}
              onClick={() => selectEngine(i)}
            >
              <span
                className="engine-option-badge"
                style={{ background: eng.color }}
              >
                {eng.letter}
              </span>
              <span className="engine-option-label">{eng.label}</span>
              {i === engineIdx && <span className="engine-check">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── 搜索建议 ── */}
      {hasSuggestions && (
        <ul className="suggest-list">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={`suggest-item ${i === activeIdx ? "suggest-item--active" : ""}`}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                navigateToSearch(s);
              }}
            >
              <svg
                className="suggest-icon"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="suggest-text">{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
