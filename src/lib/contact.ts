/** Storefront contact — single source for footer, liên hệ, hotline CTAs. */
export const STORE_ADDRESS =
  "Nhà C108 Đường Lê Thị Riêng, Khu dân cư Thới An, Quận 12, TpHCM";

export const HOTLINE_DISPLAY = "0377.613.994";

/** Digits only for `tel:` hrefs. */
export function hotlineTel(display: string = HOTLINE_DISPLAY) {
  return display.replace(/\D/g, "");
}
