export function DiscreteColor({ color, category }) {
  return (
    <div className="flex items-center w-24 h-12  rounded-md bg-gray-700">
      <div
        className="w-8 h-8 m-2 border border-white rounded-2xl"
        style={{ backgroundColor: color }}
      ></div>
      <div className="flex-1 text-sm">{category}</div>
    </div>
  );
}
