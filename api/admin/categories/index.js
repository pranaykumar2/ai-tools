const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Get all distinct categories from the database
        const { data: tools, error } = await supabase
            .from('ai_tools')
            .select('tool_category')
            .not('tool_category', 'is', null);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch categories' 
            });
        }

        // Extract unique categories
        const categories = [...new Set(tools.map(tool => tool.tool_category))]
            .filter(category => category && category.trim() !== '')
            .sort();

        res.json({ 
            success: true, 
            categories: categories 
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch categories' 
        });
    }
}
