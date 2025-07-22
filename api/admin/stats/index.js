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
        // Get total tools count
        const { data: allTools, error: allToolsError } = await supabase
            .from('ai_tools')
            .select('id, approved, submitter_name, tool_category', { count: 'exact' });

        if (allToolsError) {
            throw allToolsError;
        }

        // Calculate stats
        const totalTools = allTools.length;
        const pendingSubmissions = allTools.filter(tool => !tool.approved).length;
        const approvedTools = allTools.filter(tool => tool.approved).length;
        
        // Get unique contributors
        const uniqueContributors = new Set(
            allTools.map(tool => tool.submitter_name)
                .filter(name => name && name.trim() !== '')
        ).size;

        // Get category distribution
        const categoryDistribution = {};
        allTools.forEach(tool => {
            if (tool.tool_category) {
                categoryDistribution[tool.tool_category] = 
                    (categoryDistribution[tool.tool_category] || 0) + 1;
            }
        });

        // Calculate average rating (placeholder - you might want to add a ratings table)
        const avgRating = 4.2; // Placeholder value

        res.json({ 
            success: true, 
            stats: {
                totalTools,
                pendingSubmissions,
                approvedTools,
                contributors: uniqueContributors,
                avgRating,
                categoryDistribution
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch statistics' 
        });
    }
}
