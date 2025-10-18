import axios from 'axios';

const DROPSHIP_PROVIDER_API_URL = process.env.DROPSHIP_PROVIDER_API_URL;

export const fetchProducts = async () => {
    try {
        const response = await axios.get(`${DROPSHIP_PROVIDER_API_URL}/products`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching products from dropship provider');
    }
};

export const fetchProductById = async (id: string) => {
    try {
        const response = await axios.get(`${DROPSHIP_PROVIDER_API_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching product with id ${id} from dropship provider`);
    }
};

export const createOrder = async (orderData: any) => {
    try {
        const response = await axios.post(`${DROPSHIP_PROVIDER_API_URL}/orders`, orderData);
        return response.data;
    } catch (error) {
        throw new Error('Error creating order with dropship provider');
    }
};