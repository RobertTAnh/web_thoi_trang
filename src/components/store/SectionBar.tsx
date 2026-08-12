import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  moreLabel?: string;
  tone?: "orange" | "red";
};

export function SectionBar({
  title,
  href,
  moreLabel = "Xem thêm",
  tone = "orange",
}: Props) {
  const pill = tone === "red" ? "bg-[#e31c23]" : "bg-[#f07a2a]";
  const link = tone === "red" ? "text-[#e31c23] border-[#e31c23]" : "text-[#f07a2a] border-[#f07a2a]";

  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2
        className={`shrink-0 rounded-full ${pill} px-5 py-2 text-[13px] font-bold tracking-wide text-white uppercase md:text-[14px]`}
      >
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-[12px] font-bold uppercase ${link} hover:bg-[#fff7f0]`}
        >
          <span className="hidden h-px w-10 bg-current opacity-40 sm:block" />
          {moreLabel}
          <span aria-hidden>›</span>
        </Link>
      ) : (
        <div className="h-px flex-1 bg-line" />
      )}
    </div>
  );
}
