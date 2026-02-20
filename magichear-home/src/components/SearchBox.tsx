import { useRef, useState, useCallback } from "react";

interface SearchBoxProps {
  className?: string;
}

/** 必应搜索框组件 */
export default function SearchBox({ className = "" }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`search-box-component ${className}`}>
      <form
        action="https://cn.bing.com/search"
        method="get"
        target="_self"
        style={{ display: "flex", width: "100%", height: "100%" }}
      >
        <div style={{ flex: 8.5, padding: 0, position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            name="q"
            placeholder="请输入要搜索的内容："
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", height: "50px", border: 0 }}
          />
          <div
            className="clear-button"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              display: query.length > 0 ? "block" : "none",
              cursor: "pointer",
            }}
            onClick={handleClear}
          >
            X
          </div>
        </div>
        <div style={{ flex: 1.5, padding: 0 }}>
          <input
            type="submit"
            className="search-button"
            value="搜索"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </form>
    </div>
  );
}
