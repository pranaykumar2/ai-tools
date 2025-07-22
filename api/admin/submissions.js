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
            const { status, category, dateFilter, page = 1, limit = 10 } = req.query;
            
            let query = supabase.from('ai_tools').select('*');
            
            // Apply filters
            if (status && status !== 'all') {
                query = query.eq('status', status);
            }
            
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }
            
            // Apply date filter
            if (dateFilter && dateFilter !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (dateFilter) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                }
                
                if (startDate) {
                    query = query.gte('created_at', startDate.toISOString());
                }
            }
            
            // Apply pagination
            const from = (page - 1) * limit;
            query = query.range(from, from + limit - 1);
            
            // Order by creation date
            query = query.order('created_at', { ascending: false });

            const { data: submissions, error, count } = await query;

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            return res.json({ 
                success: true, 
                submissions: submissions || [],
                totalCount: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            });
        }

        if (req.method === 'PUT') {
            const { action, toolIds, rejectionReason } = req.body;
            
            if (!action || !toolIds || !Array.isArray(toolIds)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields: action and toolIds array' 
                });
            }

            if (action === 'approve') {
                const { data, error } = await supabase
                    .from('ai_tools')
                    .update({ 
                        status: 'approved',
                        approved_at: new Date().toISOString()
                    })
                    .in('id', toolIds);

                if (error) {
                    console.error('Approval error:', error);
                    return res.status(500).json({ success: false, message: 'Failed to approve tools' });
                }

                return res.json({ 
                    success: true, 
                    message: `${toolIds.length} tool(s) approved successfully` 
                });

            } else if (action === 'reject') {
                const { data, error } = await supabase
                    .from('ai_tools')
                    .update({ 
                        status: 'rejected',
                        rejection_reason: rejectionReason || 'No reason provided',
                        rejected_at: new Date().toISOString()
                    })
                    .in('id', toolIds);

                if (error) {
                    console.error('Rejection error:', error);
                    return res.status(500).json({ success: false, message: 'Failed to reject tools' });
                }

                return res.json({ 
                    success: true, 
                    message: `${toolIds.length} tool(s) rejected successfully` 
                });
            }

            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Use "approve" or "reject"' 
            });
        }

        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Error in submissions API:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}
