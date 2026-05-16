import { query, queryOne } from './mysql';

export interface Product {
  id: number;
  slug: string;
  name: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  category_slug: string | null;
  category_id: number | null;
  image_url: string | null;
  hero_image_url: string | null;
  icon_url: string | null;
  service_id: number;
  service_name: string;
  service_slug: string;
  service_short_description: string | null;
  freelancer_id: number | null;
  freelancer_name: string | null;
  base_price_cents: number | null;
  price_cents: number | null;
  currency: string;
  delivery_days: number | null;
  status: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const nowIso = () => new Date().toISOString();

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 101,
    slug: 'shopify-store-in-a-box',
    name: 'Shopify Store-in-a-Box',
    title: 'Shopify Store-in-a-Box',
    summary: 'Fully managed storefront setup with automation-ready workflows.',
    description:
      'Complete Shopify store design, payment gateway configuration, product import templates, and onboarding automation for busy founders.',
    category: 'Web Development',
    category_slug: 'web-development',
    category_id: null,
    image_url: '/images/products/product-1.jpg',
    hero_image_url: '/images/products/product-1.jpg',
    icon_url: null,
    service_id: 1,
    service_name: 'Website Development',
    service_slug: 'website-development',
    service_short_description: 'Custom website development services',
    freelancer_id: null,
    freelancer_name: 'Uniti Studio',
    base_price_cents: 450000,
    price_cents: 450000,
    currency: 'AUD',
    delivery_days: 21,
    status: 'active',
    is_featured: true,
    is_active: true,
    display_order: 1,
    created_at: nowIso(),
    updated_at: nowIso()
  },
  {
    id: 102,
    slug: 'amazon-fba-launch-kit',
    name: 'Amazon FBA Launch Kit',
    title: 'Amazon FBA Launch Kit',
    summary: 'Keyword research, listing copy, and PPC starter campaigns.',
    description:
      'Done-for-you ASIN launch system that bundles listing optimisation, photo direction, PPC starter campaigns, and growth analytics dashboard.',
    category: 'E-commerce',
    category_slug: 'ecommerce',
    category_id: null,
    image_url: '/images/products/product-2.jpg',
    hero_image_url: '/images/products/product-2.jpg',
    icon_url: null,
    service_id: 2,
    service_name: 'E-commerce Development',
    service_slug: 'ecommerce-development',
    service_short_description: 'Full-featured e-commerce platform development',
    freelancer_id: null,
    freelancer_name: 'Uniti Operations',
    base_price_cents: 320000,
    price_cents: 320000,
    currency: 'AUD',
    delivery_days: 28,
    status: 'active',
    is_featured: false,
    is_active: true,
    display_order: 2,
    created_at: nowIso(),
    updated_at: nowIso()
  },
  {
    id: 103,
    slug: 'customer-success-playbook',
    name: 'Customer Success Playbook',
    title: 'Customer Success Playbook',
    summary: 'Onboarding, help-center build, and CS automation program.',
    description:
      'Customer success operators build automated onboarding, retention plays, and support macros that keep first-response under 24 hours.',
    category: 'Operations',
    category_slug: 'operations',
    category_id: null,
    image_url: '/images/products/product-3.jpg',
    hero_image_url: '/images/products/product-3.jpg',
    icon_url: null,
    service_id: 3,
    service_name: 'Business Consulting',
    service_slug: 'business-consulting',
    service_short_description: 'Strategic business consulting services',
    freelancer_id: null,
    freelancer_name: 'Uniti CX Guild',
    base_price_cents: 280000,
    price_cents: 280000,
    currency: 'AUD',
    delivery_days: 14,
    status: 'active',
    is_featured: false,
    is_active: true,
    display_order: 3,
    created_at: nowIso(),
    updated_at: nowIso()
  }
];

export interface ProductQueryOptions {
  categoryName?: string;
  categorySlug?: string;
  includeInactive?: boolean;
  limit?: number;
  search?: string;
  status?: string;
}

type ProductQueryRow = {
  id: number;
  slug: string;
  title: string | null;
  summary: string | null;
  listing_description: string | null;
  hero_image_url: string | null;
  base_price_cents: number | null;
  currency: string | null;
  delivery_days: number | null;
  status: string;
  display_order: number;
  is_featured: 'TRUE' | 'FALSE';
  created_at: string;
  updated_at: string;
  service_id: number;
  service_slug: string;
  service_name: string;
  service_description: string | null;
  service_short_description: string | null;
  icon_url: string | null;
  service_image_url: string | null;
  service_base_price_cents: number | null;
  service_currency: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  freelancer_id: number | null;
  freelancer_name: string | null;
};

const PRODUCT_SELECT = `
  SELECT
    sl.id,
    sl.slug,
    sl.title,
    sl.summary,
    sl.description AS listing_description,
    sl.hero_image_url,
    sl.base_price_cents,
    sl.currency,
    sl.delivery_days,
    sl.status,
    sl.display_order,
    sl.is_featured,
    sl.created_at,
    sl.updated_at,
    s.id AS service_id,
    s.slug AS service_slug,
    s.name AS service_name,
    s.description AS service_description,
    s.short_description AS service_short_description,
    s.icon_url,
    s.image_url AS service_image_url,
    s.base_price_cents AS service_base_price_cents,
    s.currency AS service_currency,
    c.id AS category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    f.id AS freelancer_id,
    f.display_name AS freelancer_name
  FROM service_listings sl
  JOIN services s ON s.id = sl.service_id
  LEFT JOIN categories c ON c.id = s.category_id
  LEFT JOIN freelancers f ON f.id = sl.freelancer_id
`;

const PRODUCT_ORDER_BY = `
  ORDER BY sl.is_featured = 'TRUE' DESC,
           sl.display_order ASC,
           sl.created_at DESC
`;

const FALLBACK_PLACEHOLDER_IMAGE = '/images/products/product-placeholder.jpg';

const LOCAL_SERVICE_IMAGES: Record<string, string> = {
  'web-development': '/images/products/website-development.jpg',
  'website-development': '/images/products/website-development.jpg',
  'wordpress-development': '/images/products/wordpress-development.jpg',
  'ecommerce-development': '/images/products/ecommerce-development.jpg',
  'logo-design': '/images/products/logo-design.jpg',
  'ui-ux-design': '/images/products/ui-ux-design.jpg',
  'seo-services': '/images/products/seo-optimization.jpg',
  'social-media-management': '/images/products/social-media-management.jpg',
  'content-writing': '/images/products/content-writing.jpg',
  copywriting: '/images/products/email-marketing.jpg',
  'video-editing': '/images/products/video-editing.jpg',
  animation: '/images/products/voice-over-services.jpg',
  'business-consulting': '/images/products/technical-consulting.jpg',
  'custom-software-development': '/images/products/devops-services.jpg',
  'data-analysis': '/images/products/data-analysis.jpg',
  'digital-marketing': '/images/products/digital-marketing.jpg',
  'email-marketing': '/images/products/email-marketing.jpg',
  'translation-services': '/images/products/translation-services.jpg',
  'voice-over-services': '/images/products/voice-over-services.jpg',
  'photography-services': '/images/products/photography-services.jpg'
};

const LOCAL_SERVICE_ICONS: Record<string, string> = {
  'web-development': '/images/logo/website-design.png',
  'website-development': '/images/logo/website-design.png',
  'wordpress-development': '/images/logo/website-design.png',
  'ecommerce-development': '/images/logo/website-design.png',
  'logo-design': '/images/logo/logo-design.png',
  'ui-ux-design': '/images/logo/ui-ux-design.png',
  'seo-services': '/images/logo/seo-optimization.png',
  'social-media-management': '/images/logo/social-media.png',
  'content-writing': '/images/logo/ugc-videos.png',
  copywriting: '/images/logo/voice-over.png',
  'video-editing': '/images/logo/voice-over.png',
  animation: '/images/logo/voice-over.png',
  'business-consulting': '/images/logo/devops.png',
  'custom-software-development': '/images/logo/devops.png',
  'data-analysis': '/images/logo/data-analytics.png',
  'digital-marketing': '/images/logo/seo-optimization.png',
  'email-marketing': '/images/logo/voice-over.png',
  'translation-services': '/images/logo/voice-over.png',
  'voice-over-services': '/images/logo/voice-over.png',
  'photography-services': '/images/logo/ai-development.png'
};

const isExampleDomain = (url?: string | null) =>
  typeof url === 'string' && /example\.com/i.test(url);

const resolveLocalServiceImage = (slug?: string | null) => {
  if (!slug) return undefined;
  return LOCAL_SERVICE_IMAGES[slug];
};

const resolveLocalServiceIcon = (slug?: string | null) => {
  if (!slug) return undefined;
  return LOCAL_SERVICE_ICONS[slug];
};

const toIsoString = (value: string | Date | null | undefined): string => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString();
  return value;
};

const mapProductRow = (row: ProductQueryRow): Product => {
  const description =
    row.listing_description ||
    row.summary ||
    row.service_short_description ||
    row.service_description;

  const preferredHero =
    !isExampleDomain(row.hero_image_url) && row.hero_image_url ? row.hero_image_url : undefined;
  const preferredServiceImage =
    !isExampleDomain(row.service_image_url) && row.service_image_url
      ? row.service_image_url
      : undefined;

  const localImage = resolveLocalServiceImage(row.service_slug) || resolveLocalServiceImage(row.category_slug);
  const localIcon = resolveLocalServiceIcon(row.service_slug) || resolveLocalServiceIcon(row.category_slug);

  const imageUrl = preferredHero || preferredServiceImage || localImage || FALLBACK_PLACEHOLDER_IMAGE;
  const priceCents = row.base_price_cents ?? row.service_base_price_cents ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.title || row.service_name,
    title: row.title || row.service_name,
    summary: row.summary ?? row.service_short_description ?? null,
    description: description ?? null,
    category: row.category_name,
    category_slug: row.category_slug,
    category_id: row.category_id,
    image_url: imageUrl,
    hero_image_url: row.hero_image_url || row.service_image_url,
    icon_url:
      (!isExampleDomain(row.icon_url || undefined) && row.icon_url ? row.icon_url : localIcon) ?? null,
    service_id: row.service_id,
    service_name: row.service_name,
    service_slug: row.service_slug,
    service_short_description: row.service_short_description,
    freelancer_id: row.freelancer_id,
    freelancer_name: row.freelancer_name,
    base_price_cents: priceCents,
    price_cents: priceCents,
    currency: row.currency || row.service_currency || 'AUD',
    delivery_days: row.delivery_days,
    status: row.status,
    is_featured: row.is_featured === 'TRUE',
    is_active: row.status === 'active',
    display_order: row.display_order,
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at)
  };
};

const isTransientDbError = (error: any) => {
  const transientCodes = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST'];
  return transientCodes.includes(error?.code);
};

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

// Products API
export const getProducts = async (options: ProductQueryOptions = {}): Promise<Product[]> => {
  const {
    categoryName,
    categorySlug,
    includeInactive = false,
    limit,
    search,
    status
  } = options;

  const params: Array<string | number> = [];
  const conditions: string[] = ["s.is_active = 'TRUE'"];

  if (status) {
    conditions.push('sl.status = ?');
    params.push(status);
  } else if (!includeInactive) {
    conditions.push("sl.status = 'active'");
  }

  if (categoryName) {
    conditions.push('c.name = ?');
    params.push(categoryName);
  }

  if (categorySlug) {
    conditions.push('c.slug = ?');
    params.push(categorySlug);
  }

  if (search) {
    conditions.push(`(
      sl.title LIKE ? OR
      s.name LIKE ? OR
      c.name LIKE ?
    )`);
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let limitClause = '';
  if (limit && Number.isFinite(limit)) {
    limitClause = 'LIMIT ?';
    params.push(limit);
  }

  const sql = `
    ${PRODUCT_SELECT}
    ${whereClause}
    ${PRODUCT_ORDER_BY}
    ${limitClause}
  `;

  try {
    const rows = await query<ProductQueryRow>(sql, params);
    return rows.map(mapProductRow);
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('Service listing tables do not exist yet. Returning fallback catalog.');
      return FALLBACK_PRODUCTS;
    }
    if (isTransientDbError(error)) {
      console.warn('Products: database unavailable, serving fallback catalog');
      return FALLBACK_PRODUCTS;
    }
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (identifier: number | string): Promise<Product | null> => {
  const isNumericIdentifier =
    typeof identifier === 'number' || (typeof identifier === 'string' && /^\d+$/.test(identifier));
  const whereClause = isNumericIdentifier ? 'sl.id = ?' : 'sl.slug = ?';

  try {
    const row = await queryOne<ProductQueryRow>(
      `
        ${PRODUCT_SELECT}
        WHERE ${whereClause}
          AND s.is_active = 'TRUE'
          AND sl.status = 'active'
        LIMIT 1
      `,
      [identifier]
    );

    if (!row) {
      return null;
    }

    return mapProductRow(row);
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return FALLBACK_PRODUCTS.find((product) =>
        isNumericIdentifier ? product.id === Number(identifier) : product.slug === identifier
      ) ?? null;
    }
    if (isTransientDbError(error)) {
      return FALLBACK_PRODUCTS.find((product) =>
        isNumericIdentifier ? product.id === Number(identifier) : product.slug === identifier
      ) ?? null;
    }
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
};

// Orders API
// TODO: Migrate to MySQL - orders table needs to be created
export const createOrder = async (_orderData: {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
}): Promise<Order> => {
  throw new Error('Order creation not yet migrated to MySQL. Please create orders and order_items tables first.');
};

// TODO: Migrate to MySQL
export const getOrders = async (): Promise<Order[]> => {
  try {
    // TODO: Implement MySQL query for orders with order_items join
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

// TODO: Migrate to MySQL
export const updateOrderStatus = async (_id: number, _status: string): Promise<Order> => {
  throw new Error('Order update not yet migrated to MySQL');
};

// Admin functions
// TODO: Migrate to MySQL
export const createProduct = async (_productData: {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}): Promise<Product> => {
  throw new Error('Product creation not yet migrated to MySQL');
};

// TODO: Migrate to MySQL
export const updateProduct = async (_id: number, _productData: Partial<Product>): Promise<Product> => {
  throw new Error('Product update not yet migrated to MySQL');
};

// TODO: Migrate to MySQL
export const deleteProduct = async (_id: number): Promise<void> => {
  throw new Error('Product deletion not yet migrated to MySQL');
};

// Legacy function for backward compatibility
export const processOrder = async (orderData: any): Promise<any> => {
  return createOrder(orderData);
};
