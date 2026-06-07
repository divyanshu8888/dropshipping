import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: 'This legacy messaging endpoint has been replaced by the SQL-backed message APIs.',
    replacement: {
      clientMessages: '/api/clients/messages',
      freelancerSendMessage: '/api/freelancers/send-message',
    },
  });
}
