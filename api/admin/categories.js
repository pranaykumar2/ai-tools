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
            // Get categories distribution
            const { data: tools, error } = await supabase
                .from('ai_tools')
                .select('category, status')
                .eq('status', 'approved');

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            // Count tools by category
            const categoryDistribution = {};
            tools.forEach(tool => {
                const category = tool.category || 'Uncategorized';
                categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
            });

            // Convert to array format for charts
            const distributionArray = Object.entries(categoryDistribution).map(([category, count]) => ({
                category,
                count,
                percentage: ((count / tools.length) * 100).toFixed(1)
            }));

            // Get all unique categories for filters
            const { data: allCategories, error: categoriesError } = await supabase
                .from('ai_tools')
                .select('category')
                .not('category', 'is', null);

            if (categoriesError) {
                console.error('Categories error:', categoriesError);
                return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
            }

            const uniqueCategories = [...new Set(allCategories.map(t => t.category))];

            return res.json({ 
                success: true, 
                distribution: distributionArray,
                categories: uniqueCategories
            });
        }

        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Error in categories API:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}
