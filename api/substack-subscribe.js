export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const response = await fetch('https://shipsolo.substack.com/api/v1/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            first_url: 'https://shipsolo.substack.com',
            first_referrer: 'https://jettypod.com',
            current_url: 'https://shipsolo.substack.com',
            current_referrer: 'https://jettypod.com'
        })
    });

    const data = await response.text();
    res.status(response.status).send(data);
}
