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

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ 
            success: false, 
            message: 'Tool ID is required' 
        });
    }

    try {
        if (req.method === 'PUT') {
            // Approve tool
            const { data, error } = await supabase
                .from('ai_tools')
                .update({ 
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.json({ success: true, message: 'Tool approved successfully', tool: data });
        }

        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Error approving tool:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}
