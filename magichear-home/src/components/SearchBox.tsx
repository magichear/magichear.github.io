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

/** 构建 OpenSearch 风格的搜索建议 URL */
function buildSuggestUrl(engine: SearchEngine, query: string): string | null {
  const q = encodeURIComponent(query);
  switch (engine.id) {
    case "yandex":
      return `https://suggest.yandex.com/suggest-ff.cgi?part=${q}&uil=zh`;
    case "bing":
      return `https://api.bing.com/osjson.aspx?query=${q}`;
    case "google":
      return `https://www.google.com/complete/search?client=firefox&q=${q}`;
    default:
      return null;
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
  const [focused, setFocused] = useState(false);

  /* ── refs ── */
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const engine = ENGINES[engineIdx];
  const isActive = focused || query.length > 0 || engineOpen || suggestVisible;
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

  /* ── 搜索建议 (debounce + abort) ── */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSuggestVisible(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const url = buildSuggestUrl(engine, query);
      if (!url) return;

      fetch(url, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((data) => {
          // OpenSearch JSON: ["query", ["s1","s2",...]]
          if (Array.isArray(data) && Array.isArray(data[1])) {
            setSuggestions(data[1].slice(0, 8));
            setSuggestVisible(true);
            setActiveIdx(-1);
          }
        })
        .catch(() => {
          /* CORS / network — 静默降级 */
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
              setFocused(true);
              if (suggestions.length > 0) setSuggestVisible(true);
            }}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
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
