type SapoRequestInit = RequestInit & { query?: Record<string, string | number | undefined> };

export class SapoError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "SapoError";
    this.status = status;
    this.body = body;
  }
}

export type SapoProduct = {
  id: number;
  name: string;
  alias?: string;
  content?: string;
  vendor?: string;
  product_type?: string;
  published?: boolean;
  images?: { src: string; position?: number }[];
  variants?: SapoVariant[];
  options?: { name: string; values?: string[] }[];
};

export type SapoVariant = {
  id: number;
  product_id: number;
  title?: string;
  price: number | string;
  compare_at_price?: number | string | null;
  sku?: string;
  barcode?: string;
  inventory_quantity?: number;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  image?: { src?: string } | null;
};

export type SapoOrderPayload = {
  order: {
    email?: string;
    phone?: string;
    note?: string;
    gateway?: string;
    financial_status?: string;
    fulfillment_status?: string | null;
    send_receipt?: boolean;
    line_items: { variant_id: number; quantity: number; price?: number }[];
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      address1?: string;
      phone?: string;
      city?: string;
      country?: string;
    };
    billing_address?: {
      first_name?: string;
      last_name?: string;
      address1?: string;
      phone?: string;
      city?: string;
      country?: string;
    };
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SapoClient {
  private baseUrl: string;
  private token: string;
  private lastRequestAt = 0;
  private minIntervalMs = 1600; // ~37 req/min under Sapo limit

  constructor(storeUrl?: string, token?: string) {
    this.baseUrl = (storeUrl || process.env.SAPO_STORE_URL || "").replace(/\/$/, "");
    this.token = token || process.env.SAPO_ACCESS_TOKEN || "";
  }

  isConfigured() {
    return Boolean(this.baseUrl && this.token);
  }

  private async throttle() {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.minIntervalMs) {
      await sleep(this.minIntervalMs - elapsed);
    }
    this.lastRequestAt = Date.now();
  }

  async request<T>(path: string, init: SapoRequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new SapoError("Sapo is not configured", 503);
    }

    await this.throttle();

    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    if (init.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
      }
    }

    const { query: _q, headers, ...rest } = init;
    const res = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        "X-Sapo-Access-Token": this.token,
        ...headers,
      },
    });

    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!res.ok) {
      throw new SapoError(`Sapo API error ${res.status}`, res.status, body);
    }

    return body as T;
  }

  async testConnection() {
    try {
      return await this.request<{ shop?: { name?: string; domain?: string } }>(
        "/admin/shop.json",
      );
    } catch {
      return this.request<{ shop?: { name?: string; domain?: string }; store?: { name?: string; domain?: string } }>(
        "/admin/store.json",
      );
    }
  }

  async listProducts(page = 1, limit = 50) {
    return this.request<{ products: SapoProduct[] }>("/admin/products.json", {
      query: { page, limit },
    });
  }

  async getProduct(id: number | string) {
    return this.request<{ product: SapoProduct }>(`/admin/products/${id}.json`);
  }

  async createOrder(payload: SapoOrderPayload) {
    return this.request<{ order: { id: number; name?: string } }>("/admin/orders.json", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateVariantInventory(variantId: number | string, inventoryQuantity: number) {
    return this.request(`/admin/variants/${variantId}.json`, {
      method: "PUT",
      body: JSON.stringify({
        variant: { id: Number(variantId), inventory_quantity: inventoryQuantity },
      }),
    });
  }
}

export function getSapoClient(storeUrl?: string, token?: string) {
  return new SapoClient(storeUrl, token);
}
