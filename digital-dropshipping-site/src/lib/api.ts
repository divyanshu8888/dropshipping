import { supabase } from './supabase';

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
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Products table does not exist. Please create it in Supabase dashboard.');
        return [];
      }
      throw error;
    }

    return products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProduct = async (id: number): Promise<Product | null> => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      throw error;
    }

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

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_address: orderData.customerAddress,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return {
      ...completeOrder,
      items: completeOrder.order_items || []
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return orders?.map(order => ({
      ...order,
      items: order.order_items || []
    })) || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...order,
      items: order.order_items || []
    };
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
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        image_url: productData.imageUrl,
        stock: productData.stock,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
};

export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Legacy function for backward compatibility
export const processOrder = async (orderData: any): Promise<any> => {
  return createOrder(orderData);
};
