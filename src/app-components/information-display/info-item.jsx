export function InfoItem({ children, header, optional = null, size = "" }) {
  return (
    <div
      className={`flex flex-col gap-2 bg-[#2B2B2B] rounded-md text-white p-2 ${size}`}
    >
      <div className="flex gap-2 text-md font-bold">
        {header}
        {optional}
      </div>
      {children}
    </div>
  );
}
