import Script from "next/script";

const reels = [
  {
    id: "1088524837167738",
    url: "https://www.facebook.com/reel/1088524837167738/",
  },
  {
    id: "1023230153680619",
    url: "https://www.facebook.com/reel/1023230153680619/",
  },
];

function facebookEmbedUrl(url: string) {
  const params = new URLSearchParams({
    height: "642",
    href: url,
    show_text: "false",
    width: "360",
    t: "0",
  });

  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

export function FacebookReels() {
  return (
    <section className="overflow-hidden bg-[#fff8f3] py-10 md:py-14">
      <div className="container-ega">
        <div className="mx-auto mb-7 max-w-2xl text-center md:mb-9">
          <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-[#e31c23] uppercase">
            Tisora trên mạng xã hội
          </p>
          <h2 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
            Mặc đẹp cùng Tisora
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-muted md:text-sm">
            Xem váy lên dáng thật và khám phá thêm cảm hứng phối đồ mỗi ngày.
          </p>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:items-start sm:justify-items-center sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-7">
          <article className="w-[min(360px,calc(100vw-32px))] shrink-0 snap-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_35px_rgba(63,38,19,0.10)]">
            <blockquote
              className="instagram-media m-0! w-full! min-w-0! max-w-none! border-0! bg-white!"
              data-instgrm-permalink="https://www.instagram.com/reel/Db5btVlCci9/"
              data-instgrm-version="14"
            >
              <div className="flex aspect-[9/16] items-center justify-center bg-[#eee7df] px-6 text-center">
                <a
                  href="https://www.instagram.com/reel/Db5btVlCci9/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-accent"
                >
                  Xem Reel của Tisora trên Instagram
                </a>
              </div>
            </blockquote>
          </article>

          {reels.map((reel, index) => (
            <article
              key={reel.id}
              className="w-[min(360px,calc(100vw-32px))] shrink-0 snap-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_35px_rgba(63,38,19,0.10)]"
            >
              <div className="aspect-[9/16] w-full bg-[#eee7df]">
                <iframe
                  src={facebookEmbedUrl(reel.url)}
                  title={`Facebook Reel Tisora ${index + 1}`}
                  width="360"
                  height="642"
                  className="block h-full w-full border-0"
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted sm:hidden">
          Vuốt ngang để xem thêm
        </p>
      </div>
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </section>
  );
}
