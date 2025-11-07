export default function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    console.log('Received check-in:', data);
    return res.status(200).json({ message: 'Check-in received', data });
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
