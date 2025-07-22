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
        // Fetch all tools with their submission details
        const { data: tools, error } = await supabase
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch tools' 
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
            tools: formattedTools 
        });

    } catch (error) {
        console.error('Error fetching tools:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch tools' 
        });
    }
}
