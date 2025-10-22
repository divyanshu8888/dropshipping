// import axios from 'axios';

const DROPSHIP_PROVIDER_API_URL = process.env.DROPSHIP_PROVIDER_API_URL;

export const fetchProducts = async () => {
    try {
        const response = await fetch(`${DROPSHIP_PROVIDER_API_URL}/products`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error fetching products from dropship provider');
    }
};

export const fetchProductById = async (id: string) => {
    try {
        const response = await fetch(`${DROPSHIP_PROVIDER_API_URL}/products/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error(`Error fetching product with id ${id} from dropship provider`);
    }
};

export const createOrder = async (orderData: any) => {
    try {
        const response = await fetch(`${DROPSHIP_PROVIDER_API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error creating order with dropship provider');
    }
};