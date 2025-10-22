import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            try {
                const { data: workRequests, error } = await supabase
                    .from('projects')
                    .select(`
                        *,
                        clients (
                            id,
                            name
                        ),
                        freelancers (
                            id,
                            name,
                            rating
                        ),
                        services (*)
                    `);
                
                if (error) {
                    throw error;
                }
                
                res.status(200).json(workRequests || []);
            } catch (error) {
                console.error('Error fetching work requests:', error);
                res.status(500).json({ message: 'Error fetching work requests' });
            }
            break;

        case 'POST':
            try {
                const { title, description, budget, deadline, client_id, service_id } = req.body;
                const { data: workRequest, error } = await supabase
                    .from('projects')
                    .insert({
                        title,
                        description,
                        budget,
                        deadline,
                        client_id,
                        service_id,
                        status: 'open'
                    })
                    .select()
                    .single();
                
                if (error) {
                    throw error;
                }
                
                res.status(201).json(workRequest);
            } catch (error) {
                console.error('Error creating work request:', error);
                res.status(500).json({ message: 'Error creating work request' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}