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
            const { status, category, search, page = 1, limit = 10 } = req.query;
            
            let query = supabase.from('ai_tools').select('*', { count: 'exact' });
            
            // Apply filters
            if (status && status !== 'all') {
                query = query.eq('status', status);
            }
            
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }
            
            if (search) {
                query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
            }
            
            // Apply pagination
            const from = (page - 1) * limit;
            query = query.range(from, from + limit - 1);
            
            // Order by creation date
            query = query.order('created_at', { ascending: false });

            const { data: tools, error, count } = await query;

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.json({ 
                success: true, 
                tools: tools || [],
                totalCount: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            });
        }

        if (req.method === 'PUT') {
            const { action, toolIds } = req.body;
            
            if (!action || !toolIds || !Array.isArray(toolIds)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields: action and toolIds array' 
                });
            }

            if (action === 'toggleStatus') {
                // Get current tools to toggle their status
                const { data: currentTools, error: fetchError } = await supabase
                    .from('ai_tools')
                    .select('id, status')
                    .in('id', toolIds);

                if (fetchError) {
                    console.error('Fetch error:', fetchError);
                    return res.status(500).json({ success: false, message: 'Failed to fetch tools' });
                }

                // Update each tool's status
                for (const tool of currentTools) {
                    const newStatus = tool.status === 'approved' ? 'pending' : 'approved';
                    const updateData = { status: newStatus };
                    
                    if (newStatus === 'approved') {
                        updateData.approved_at = new Date().toISOString();
                    }

                    const { error: updateError } = await supabase
                        .from('ai_tools')
                        .update(updateData)
                        .eq('id', tool.id);

                    if (updateError) {
                        console.error('Update error:', updateError);
                        return res.status(500).json({ success: false, message: 'Failed to update tool status' });
                    }
                }

                return res.json({ 
                    success: true, 
                    message: `${toolIds.length} tool(s) status updated successfully` 
                });
            }

            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Use "toggleStatus"' 
            });
        }

        if (req.method === 'DELETE') {
            const { toolIds } = req.body;
            
            if (!toolIds || !Array.isArray(toolIds)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required field: toolIds array' 
                });
            }

            const { error } = await supabase
                .from('ai_tools')
                .delete()
                .in('id', toolIds);

            if (error) {
                console.error('Delete error:', error);
                return res.status(500).json({ success: false, message: 'Failed to delete tools' });
            }

            return res.json({ 
                success: true, 
                message: `${toolIds.length} tool(s) deleted successfully` 
            });
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
