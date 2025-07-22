const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tool ID is required' 
            });
        }

        // Delete tool from database
        const { error } = await supabase
            .from('ai_tools')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to delete tool' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Tool deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete tool' 
        });
    }
}
