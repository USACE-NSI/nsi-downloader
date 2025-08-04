import { useState, useRef, useEffect } from "react";
import { useConnect } from "redux-bundler-hook";

/* ——————————————————————————————————————————
   Close menu when user clicks outside
—————————————————————————————————————————— */
function useOutsideClick(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* ——————————————————————————————————————————
   Dropdown
—————————————————————————————————————————— */
function CustomDropdown({ items }) {
  const { doInfoChangeSelectedProperty } = useConnect(
    "doInfoChangeSelectedProperty"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [selected, setSelected] = useState(null);
  const wrapperRef = useRef();

  useOutsideClick(wrapperRef, () => setIsOpen(false));

  const toggle = () => setIsOpen((o) => !o);

  function handleKeyDown(e) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % items.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + items.length) % items.length);
    }
    if (e.key === "Enter") {
      setSelected(items[highlight]);
      setIsOpen(false);
    }
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggle}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {selected ?? "Choose…"}
        {/* simple ▼ caret */}
        <span className="text-xs">&#9662;</span>
      </button>

      {/* Menu */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {items.map((item, i) => (
            <li
              key={item}
              role="option"
              aria-selected={selected === item}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => {
                setSelected(item);
                setIsOpen(false);
                doInfoChangeSelectedProperty(item);
              }}
              className={[
                /* base list-item styles */
                "cursor-pointer select-none px-3 py-2",
                /* highlighted row */
                highlight === i && "bg-indigo-50 text-indigo-700",
                /* selected row */
                selected === item && "font-medium text-indigo-600",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ——————————————————————————————————————————
   Example usage
—————————————————————————————————————————— */
export default function Example() {
  return (
    <div>
      <CustomDropdown items={["Red", "Green", "Blue"]} />
    </div>
  );
}
