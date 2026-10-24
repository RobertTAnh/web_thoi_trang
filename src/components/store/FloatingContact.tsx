import { HOTLINE_DISPLAY, hotlineTel } from "@/lib/contact";

const hotline = HOTLINE_DISPLAY;
const tel = hotlineTel(hotline);

export function FloatingContact() {
  return (
    <div className="fixed right-4 bottom-4 z-40 hidden flex-col gap-2 lg:flex">
      <a
        href={`tel:${tel}`}
        className="rounded-full bg-ink px-4 py-2 text-xs text-white shadow-lg"
      >
        Gọi {hotline}
      </a>
      <a
        href="https://zalo.me/"
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-[#0068ff] px-4 py-2 text-xs text-white shadow-lg"
      >
        Chat Zalo
      </a>
    </div>
  );
}
