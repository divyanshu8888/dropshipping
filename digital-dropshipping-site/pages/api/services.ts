import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            try {
                const services = await prisma.service.findMany({
                    include: {
                        freelancer: {
                            select: {
                                id: true,
                                name: true,
                                rating: true,
                            },
                        },
                    },
                });
                res.status(200).json(services);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching services' });
            }
            break;

        case 'POST':
            try {
                const { title, description, price, category, deliveryTime, userId } = req.body;
                const service = await prisma.service.create({
                    data: {
                        title,
                        description,
                        price,
                        category,
                        deliveryTime,
                        userId,
                    },
                });
                res.status(201).json(service);
            } catch (error) {
                res.status(500).json({ message: 'Error creating service' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}