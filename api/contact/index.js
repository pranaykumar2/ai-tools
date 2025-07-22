const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Store contact message in database (you may want to create a contacts table)
        const { data, error } = await supabase
            .from('contacts')
            .insert([{
                name: name,
                email: email,
                message: message,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send message' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Thank you for your message! We will get back to you soon.' 
        });

    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message' 
        });
    }
}
