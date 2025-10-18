import { prisma } from './prisma';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

// Products API
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

export const getProduct = async (id: number): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true }
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product');
  }
};

// Orders API
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
  try {
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerAddress: orderData.customerAddress,
        totalAmount,
        status: 'pending',
        items: {
          create: orderData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    return order;
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
};

// Admin functions
export const createProduct = async (productData: {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}): Promise<Product> => {
  try {
    const product = await prisma.product.create({
      data: productData
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: productData
    });
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Legacy function for backward compatibility
export const processOrder = async (orderData: any): Promise<any> => {
  return createOrder(orderData);
};
