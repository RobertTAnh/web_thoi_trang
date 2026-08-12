import Link from "next/link";

type Props = {
  title: string;
  href?: string;
  moreLabel?: string;
};

export function SectionBar({ title, href, moreLabel = "Xem thêm" }: Props) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 className="shrink-0 rounded-full bg-[#f07a2a] px-5 py-2 text-[14px] font-bold tracking-wide text-white uppercase md:text-[15px]">
        {title}
      </h2>
      <div className="h-px flex-1 bg-line" />
      {href && (
        <Link
          href={href}
          className="shrink-0 text-[13px] font-semibold text-[#f07a2a] uppercase hover:text-accent"
        >
          {moreLabel} →
        </Link>
      )}
    </div>
  );
}
