const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            // Get all tools for admin
            const { data: tools, error } = await supabase
                .from('ai_tools')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.json({ success: true, tools: tools || [] });
        }

        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Error in admin tools API:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}
