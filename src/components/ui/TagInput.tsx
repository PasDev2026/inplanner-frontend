import { useState, useRef, useEffect, useMemo } from "react";

type Option = {
  id: number;
  nombre: string;
};

type TagInputProps = {
  label: string;
  options: Option[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
};

export default function TagInput({ label, options, value, onChange, placeholder }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q
      ? options.filter((o) => o.nombre.toLowerCase().includes(q))
      : options;
  }, [query, options]);

  const visible = query.trim() ? filtered : options.filter((o) => !selectedSet.has(o.id));

  useEffect(() => {
    if (open) setFocusedIndex(-1);
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (id: number) => {
    const next = selectedSet.has(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(next);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => (i < visible.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => (i > 0 ? i - 1 : visible.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < visible.length) {
          select(visible[focusedIndex].id);
        }
        break;
      case "Escape":
        setOpen(false);
        setQuery("");
        break;
      case "Backspace":
        if (!query && value.length) {
          onChange(value.slice(0, -1));
        }
        break;
    }
  };

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 select-none">
        {label}
      </label>
      <div
        className="w-full min-h-[42px] px-3 py-2 border border-border rounded-lg bg-card focus-within:ring-4 focus-within:ring-brand-primary/10 focus-within:border-brand-primary transition-all duration-150 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => {
            const opt = options.find((o) => o.id === id);
            if (!opt) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-brand-primary/10 text-brand-primary rounded-md border border-border"
              >
                {opt.nombre}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); select(id); }}
                  className="text-brand-primary/60 hover:text-brand-primary cursor-pointer"
                >
                  &times;
                </button>
              </span>
            );
          })}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 min-w-[80px] text-xs text-foreground bg-transparent outline-none border-none p-0 leading-6"
            placeholder={value.length === 0 ? (placeholder ?? "Buscar...") : ""}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      {open && visible.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {visible.map((opt, i) => (
            <button
              type="button"
              key={opt.id}
              onMouseDown={() => select(opt.id)}
              onMouseEnter={() => setFocusedIndex(i)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer ${
                i === focusedIndex
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {opt.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
