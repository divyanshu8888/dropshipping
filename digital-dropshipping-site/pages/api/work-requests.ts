import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            try {
                const workRequests = await prisma.workRequest.findMany({
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        freelancer: {
                            select: {
                                id: true,
                                name: true,
                                rating: true,
                            },
                        },
                        service: true,
                    },
                });
                res.status(200).json(workRequests);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching work requests' });
            }
            break;

        case 'POST':
            try {
                const { title, description, budget, deadline, clientId, serviceId } = req.body;
                const workRequest = await prisma.workRequest.create({
                    data: {
                        title,
                        description,
                        budget,
                        deadline: new Date(deadline),
                        clientId,
                        serviceId,
                    },
                });
                res.status(201).json(workRequest);
            } catch (error) {
                res.status(500).json({ message: 'Error creating work request' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}