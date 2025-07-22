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
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);
        
        // Parse the path to determine the action
        const pathParts = pathname.split('/').filter(p => p);
        
        // Handle /api/admin/tools/[id]/approve
        if (pathParts[2] === 'tools' && pathParts[4] === 'approve' && req.method === 'PUT') {
            const id = pathParts[3];
            
            const { data: tool, error } = await supabase
                .from('ai_tools')
                .update({ 
                    status: 'approved',
                    approved: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to approve tool' 
                });
            }

            return res.json({ 
                success: true, 
                message: 'Tool approved successfully',
                tool: {
                    id: tool.id,
                    name: tool.tool_name,
                    approved: tool.approved
                }
            });
        }
        
        // Handle /api/admin/tools/[id]/reject
        if (pathParts[2] === 'tools' && pathParts[4] === 'reject' && req.method === 'PUT') {
            const id = pathParts[3];
            
            const { data: tool, error } = await supabase
                .from('ai_tools')
                .update({ 
                    status: 'rejected',
                    approved: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to reject tool' 
                });
            }

            return res.json({ 
                success: true, 
                message: 'Tool rejected successfully'
            });
        }
        
        // Handle /api/admin/notifications
        if (pathParts[2] === 'notifications' && req.method === 'GET') {
            const { data: notifications, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to fetch notifications' 
                });
            }

            return res.json({ 
                success: true, 
                notifications: notifications 
            });
        }
        
        // Handle /api/admin/notifications/mark-all-read
        if (pathParts[2] === 'notifications' && pathParts[3] === 'mark-all-read' && req.method === 'PUT') {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('read', false);

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to mark notifications as read' 
                });
            }

            return res.json({ 
                success: true, 
                message: 'All notifications marked as read' 
            });
        }
        
        // Handle /api/admin/notifications/[id]/read
        if (pathParts[2] === 'notifications' && pathParts[4] === 'read' && req.method === 'PUT') {
            const id = pathParts[3];
            
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id);

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to mark notification as read' 
                });
            }

            return res.json({ 
                success: true, 
                message: 'Notification marked as read' 
            });
        }
        
        // Handle /api/admin/submissions
        if (pathParts[2] === 'submissions' && req.method === 'GET') {
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

            return res.json({ 
                success: true, 
                submissions: formattedTools,
                total: formattedTools.length
            });
        }
        
        // Handle /api/admin/categories
        if (pathParts[2] === 'categories' && req.method === 'GET') {
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

            const categories = [...new Set(tools.map(tool => tool.tool_category))]
                .filter(category => category && category.trim() !== '')
                .sort();

            return res.json({ 
                success: true, 
                categories: categories 
            });
        }
        
        // Handle /api/admin/stats
        if (pathParts[2] === 'stats' && req.method === 'GET') {
            const { data: allTools, error: allToolsError } = await supabase
                .from('ai_tools')
                .select('id, approved, submitter_name, tool_category', { count: 'exact' });

            if (allToolsError) {
                throw allToolsError;
            }

            const totalTools = allTools.length;
            const pendingSubmissions = allTools.filter(tool => !tool.approved).length;
            const approvedTools = allTools.filter(tool => tool.approved).length;
            
            const uniqueContributors = new Set(
                allTools.map(tool => tool.submitter_name)
                    .filter(name => name && name.trim() !== '')
            ).size;

            const categoryDistribution = {};
            allTools.forEach(tool => {
                if (tool.tool_category) {
                    categoryDistribution[tool.tool_category] = 
                        (categoryDistribution[tool.tool_category] || 0) + 1;
                }
            });

            const avgRating = 4.2; // Placeholder value

            return res.json({ 
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
        }

        res.status(404).json({ success: false, message: 'Endpoint not found' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
}
