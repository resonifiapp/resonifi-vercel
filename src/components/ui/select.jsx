import * as React from "react";

/**
 * Lightweight shadcn-style Select shim with NO external deps.
 * Supports:
 *   <Select value onValueChange>
 *     <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Alpha</SelectItem>
 *       <SelectItem value="b">Beta</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Renders a native <select> with Tailwind styling.
 */

const SelectCtx = React.createContext(null);

// tiny class joiner
const cn = (...a) => a.filter(Boolean).join(" ");

// ---- Public components ----
export function Select({
  value,
  defaultValue,
  onValueChange,
  className = "",
  children,
  disabled = false,
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const [placeholder, setPlaceholder] = React.useState("");
  // We’ll collect items by scanning children for <SelectItem />s
  const items = React.useMemo(() => collectItems(children), [children]);

  const current = value ?? internal;
  const handleChange = (e) => {
    const v = e.target.value;
    setInternal(v);
    onValueChange?.(v);
  };

  return (
    <SelectCtx.Provider value={{ setPlaceholder }}>
      <div className={cn("relative", className)}>
        <select
          disabled={disabled}
          value={current}
          onChange={handleChange}
          className={cn(
            "w-full appearance-none rounded-xl border border-slate-700 bg-slate-900/70",
            "px-3 py-2 pr-8 text-sm text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-teal-400/30",
            "disabled:opacity-60 disabled:pointer-events-none"
          )}
        >
          {/* Placeholder option (hidden once a real value is chosen) */}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {items.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Simple chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* We still render children to keep structure compatibility,
            but visually they don't show; SelectItem text becomes <option>s above */}
        <div className="hidden">{children}</div>
      </div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({ className = "", children, ...props }) {
  // Kept for API compatibility; actual trigger is the native <select>
  return <div className={className} {...props}>{children}</div>;
}

export function SelectValue({ placeholder = "" }) {
  const ctx = React.useContext(SelectCtx);
  React.useEffect(() => {
    ctx?.setPlaceholder?.(placeholder);
  }, [placeholder]); // eslint-disable-line
  return null;
}

export function SelectContent({ children }) {
  // Only used so <SelectItem> can live inside; hidden by parent.
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  // Marker component; parent scans for these
  return <option data-select-item value={value}>{children}</option>;
}
SelectItem.displayName = "SelectItem";

// ---- Helpers ----
function collectItems(children) {
  const out = [];
  walk(children, (el) => {
    if (!React.isValidElement(el)) return;
    const typeName =
      typeof el.type === "function" ? el.type.displayName || el.type.name : el.type;
    if (typeName === "SelectItem") {
      out.push({ value: String(el.props.value ?? ""), label: textFrom(el.props.children) });
    }
  });
  return out;
}

function walk(node, fn) {
  React.Children.forEach(node, (child) => {
    fn(child);
    if (React.isValidElement(child) && child.props?.children) {
      walk(child.props.children, fn);
    }
  });
}

function textFrom(children) {
  if (typeof children === "string" || typeof children === "number") return String(children);
  const parts = [];
  walk(children, (c) => {
    if (typeof c === "string" || typeof c === "number") parts.push(String(c));
  });
  return parts.join(" ").trim();
}

export default {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
