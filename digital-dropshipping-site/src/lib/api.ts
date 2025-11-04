import { query, queryOne } from './mysql';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
export const getProducts = async (): Promise<Product[]> => {
  try {
    // Note: Products table may not exist in MySQL yet
    // Return empty array if table doesn't exist
    const products = await query<Product>(`
      SELECT * FROM products 
      WHERE is_active = 'TRUE' 
      ORDER BY created_at DESC
    `);
    return products || [];
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('Products table does not exist. Please create it in MySQL database.');
      return [];
    }
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProduct = async (id: number): Promise<Product | null> => {
  try {
    const product = await queryOne<Product>(`
      SELECT * FROM products 
      WHERE id = ? AND is_active = 'TRUE'
    `, [id]);

    return product;
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
};

// Orders API
// TODO: Migrate to MySQL - orders table needs to be created
export const createOrder = async (orderData: {
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
export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  throw new Error('Order update not yet migrated to MySQL');
};

// Admin functions
// TODO: Migrate to MySQL
export const createProduct = async (productData: {
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
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  throw new Error('Product update not yet migrated to MySQL');
};

// TODO: Migrate to MySQL
export const deleteProduct = async (id: number): Promise<void> => {
  throw new Error('Product deletion not yet migrated to MySQL');
};

// Legacy function for backward compatibility
export const processOrder = async (orderData: any): Promise<any> => {
  return createOrder(orderData);
};
