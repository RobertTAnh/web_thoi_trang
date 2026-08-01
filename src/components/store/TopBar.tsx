export function TopBar() {
  const text =
    "CHÀO HÈ SÔI NỔI — MỎI TAY SĂN QUÀ — ƯU ĐÃI X3 — FREESHIP ĐƠN TỪ 300K — ";
  return (
    <div className="overflow-hidden bg-accent py-2 text-xs tracking-wide text-white uppercase">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        <span className="px-4">{text.repeat(4)}</span>
        <span className="px-4">{text.repeat(4)}</span>
      </div>
    </div>
  );
}
