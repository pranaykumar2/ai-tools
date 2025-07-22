const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PUT') {
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

        // Update tool status to rejected
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

        if (!tool) {
            return res.status(404).json({ 
                success: false, 
                message: 'Tool not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Tool rejected successfully',
            tool: {
                id: tool.id,
                name: tool.tool_name,
                approved: tool.approved,
                status: tool.status,
                updated_at: tool.updated_at
            }
        });

    } catch (error) {
        console.error('Error rejecting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to reject tool' 
        });
    }
}
