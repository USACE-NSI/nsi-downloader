export function InfoItem({ children, header, size = "" }) {
  return (
    <div
      className={`flex flex-col gap-2 border border-gray-400 rounded-md text-white p-2 ${size}`}
    >
      <div className="text-md font-bold">{header}</div>
      {children}
    </div>
  );
}
