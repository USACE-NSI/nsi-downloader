import { useConnect } from "redux-bundler-hook";
import { structureStyles } from "../styles/nsi-styles";

/* ───────────────────────────────────────────────
   A nicely-styled native <select> using Tailwind
──────────────────────────────────────────────── */
function StyledSelect({ items }) {
  const { infoSelectedProperty, doInfoChangeSelectedProperty } = useConnect(
    "selectInfoSelectedProperty",
    "doInfoChangeSelectedProperty"
  );

  const handleChange = (e) => {
    doInfoChangeSelectedProperty(e.target.value);
  };

  return (
    <div>
      <select
        defaultValue={infoSelectedProperty}
        onChange={handleChange}
        className="
          block w-32 m-2
          rounded-md border border-gray-300 bg-white
          text-sm p-1
          hover:border-indigo-400 hover:ring-1
          focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
          dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100
        "
      >
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Example usage
──────────────────────────────────────────────── */
export default function Example() {
  return (
    <div>
      <StyledSelect items={Object.keys(structureStyles)} />
    </div>
  );
}
