const reels = [
  {
    id: "27002010879455289",
    url: "https://www.facebook.com/reel/27002010879455289/",
  },
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
    height: "476",
    href: url,
    show_text: "false",
    width: "267",
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
            Tisora on Facebook
          </p>
          <h2 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
            Mặc đẹp cùng Tisora
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-muted md:text-sm">
            Xem váy lên dáng thật và khám phá thêm cảm hứng phối đồ mỗi ngày.
          </p>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:justify-items-center sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-8">
          {reels.map((reel, index) => (
            <article
              key={reel.id}
              className="w-[267px] shrink-0 snap-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_12px_35px_rgba(63,38,19,0.10)]"
            >
              <div className="h-[476px] w-[267px] bg-[#eee7df]">
                <iframe
                  src={facebookEmbedUrl(reel.url)}
                  title={`Facebook Reel Tisora ${index + 1}`}
                  width="267"
                  height="476"
                  className="block border-0"
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
    </section>
  );
}
