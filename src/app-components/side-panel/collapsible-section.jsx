import { useState } from "react";
import { MdExpandMore } from "react-icons/md";

export function CollapsibleSection({
  title,
  action,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col rounded-md bg-white border border-gray-300">
      <div className="flex items-center gap-2 pr-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-1 p-3 text-sm text-gray-600 hover:text-gray-900"
        >
          <MdExpandMore
            className={`shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
            size={16}
          />
          {title}
        </button>
        {action}
      </div>
      {open && <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>}
    </div>
  );
}
