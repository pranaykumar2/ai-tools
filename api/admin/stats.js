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
        // Get total tools count
        const { count: totalTools } = await supabase
            .from('ai_tools')
            .select('*', { count: 'exact', head: true });

        // Get pending submissions count
        const { count: pendingSubmissions } = await supabase
            .from('ai_tools')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Get average rating
        const { data: ratingData } = await supabase
            .from('ai_tools')
            .select('rating')
            .eq('status', 'approved');

        const avgRating = ratingData?.length ? 
            (ratingData.reduce((sum, tool) => sum + (tool.rating || 0), 0) / ratingData.length).toFixed(1) : 0;

        // Get contributors count (unique contributor names)
        const { data: contributors } = await supabase
            .from('ai_tools')
            .select('contributor_name')
            .not('contributor_name', 'is', null);

        const uniqueContributors = contributors ? 
            new Set(contributors.map(c => c.contributor_name)).size : 0;

        return res.json({
            success: true,
            stats: {
                totalTools: totalTools || 0,
                pendingSubmissions: pendingSubmissions || 0,
                avgRating: parseFloat(avgRating),
                contributors: uniqueContributors
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics' 
        });
    }
}
