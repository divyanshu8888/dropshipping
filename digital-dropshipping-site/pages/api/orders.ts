import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder, getOrders, updateOrderStatus } from '../../src/lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            try {
                const orders = await getOrders();
                res.status(200).json(orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                res.status(500).json({ message: 'Error fetching orders' });
            }
            break;

        case 'POST':
            try {
                const order = await createOrder(req.body);
                res.status(201).json(order);
            } catch (error) {
                console.error('Error creating order:', error);
                res.status(500).json({ message: 'Error creating order' });
            }
            break;

        case 'PUT':
            try {
                const { id, status } = req.body;
                if (!id || !status) {
                    return res.status(400).json({ message: 'Order ID and status are required' });
                }
                const order = await updateOrderStatus(id, status);
                res.status(200).json(order);
            } catch (error) {
                console.error('Error updating order:', error);
                res.status(500).json({ message: 'Error updating order' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}