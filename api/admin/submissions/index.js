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
        const { status, category, sortBy, order } = req.query;
        
        let query = supabase.from('ai_tools').select('*');
        
        // Apply filters
        if (status && status !== 'all') {
            if (status === 'pending') {
                query = query.eq('approved', false);
            } else if (status === 'approved') {
                query = query.eq('approved', true);
            }
        }
        
        if (category && category !== 'all') {
            query = query.eq('tool_category', category);
        }
        
        // Apply sorting
        const sortField = sortBy === 'name' ? 'tool_name' : 'created_at';
        const sortOrder = order === 'desc' ? false : true;
        query = query.order(sortField, { ascending: sortOrder });
        
        const { data: tools, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch submissions' 
            });
        }

        // Transform data for admin interface
        const formattedTools = tools.map(tool => ({
            id: tool.id,
            name: tool.tool_name,
            description: tool.tool_description,
            website: tool.tool_website,
            category: tool.tool_category,
            submittedBy: tool.submitter_name,
            submittedAt: tool.created_at,
            approved: tool.approved || false,
            status: tool.status || (tool.approved ? 'approved' : 'pending')
        }));

        res.json({ 
            success: true, 
            submissions: formattedTools,
            total: formattedTools.length
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch submissions' 
        });
    }
}
