const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { toolName, toolDescription, toolWebsite, toolCategory, submitterName } = req.body;

        // Basic validation
        if (!toolName || !toolDescription || !toolWebsite || !toolCategory || !submitterName) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Insert new tool into database
        const { data: tool, error: toolError } = await supabase
            .from('ai_tools')
            .insert([{
                tool_name: toolName,
                tool_description: toolDescription,
                tool_website: toolWebsite,
                tool_category: toolCategory,
                submitter_name: submitterName,
                approved: false,
                status: 'pending',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (toolError) {
            console.error('Tool insert error:', toolError);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to submit tool' 
            });
        }

        // Create notification for admin
        const { error: notificationError } = await supabase
            .from('notifications')
            .insert([{
                type: 'new_tool',
                message: `New tool submitted: ${toolName} by ${submitterName}`,
                tool_id: tool.id,
                read: false,
                created_at: new Date().toISOString()
            }]);

        if (notificationError) {
            console.error('Notification error:', notificationError);
            // Don't fail the request if notification creation fails
        }

        res.json({ 
            success: true, 
            message: 'Tool submitted successfully! It will be reviewed by our team.',
            toolId: tool.id
        });

    } catch (error) {
        console.error('Error submitting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit tool' 
        });
    }
}
