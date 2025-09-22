export function Dropdown({ items, defaultValue, onChange }) {
  return (
    <div>
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="
          block
          rounded-md
          text-sm p-1
          hover:border-indigo-400 hover:ring-1
          focus:border-white focus:outline-none focus:ring-2 focus:ring-indigo-500
          dark:border-slate-600 dark:bg-gray-700 dark:text-slate-100
          transition
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
