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
        
        // Handle POST requests (tool submission)
        if (req.method === 'POST') {
            let formData;
            
            try {
                // Parse FormData or JSON body
                if (req.headers['content-type']?.includes('multipart/form-data')) {
                    // This is FormData - Vercel automatically parses it to req.body
                    formData = req.body;
                } else if (req.headers['content-type']?.includes('application/json')) {
                    formData = req.body;
                } else {
                    // Default handling
                    formData = req.body;
                }

                console.log('Content-Type:', req.headers['content-type']);
                console.log('Raw body:', req.body);
                
                // Extract form fields with multiple possible field names
                const toolName = formData.name || formData.toolName || formData['tool-name'];
                const toolDescription = formData.description || formData.toolDescription || formData['tool-description'];
                const toolWebsite = formData.url || formData.toolWebsite || formData['tool-website'] || formData['tool-url'];
                const toolCategory = formData.category || formData.toolCategory || formData['tool-category'];
                const submitterName = formData.submitterName || formData['submitter-name'];
                const submitterEmail = formData.submitterEmail || formData['submitter-email'];

                console.log('Parsed fields:', {
                    toolName,
                    toolDescription,
                    toolWebsite,
                    toolCategory,
                    submitterName,
                    submitterEmail
                });

                // Basic validation
                if (!toolName || !toolDescription || !toolWebsite || !toolCategory || !submitterName) {
                    console.log('Validation failed - missing fields');
                    return res.status(400).json({ 
                        success: false, 
                        message: 'All required fields must be filled',
                        received: { toolName, toolDescription, toolWebsite, toolCategory, submitterName }
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
                        submitter_email: submitterEmail,
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
                        message: 'Failed to submit tool: ' + toolError.message 
                    });
                }

                // Create notification for admin
                try {
                    await supabase
                        .from('notifications')
                        .insert([{
                            type: 'new_tool',
                            message: `New tool submitted: ${toolName} by ${submitterName}`,
                            tool_id: tool.id,
                            read: false,
                            created_at: new Date().toISOString()
                        }]);
                } catch (notificationError) {
                    console.error('Notification error:', notificationError);
                    // Don't fail the request if notification creation fails
                }

                return res.json({ 
                    success: true, 
                    message: 'Tool submitted successfully! It will be reviewed by our team.',
                    toolId: tool.id
                });
                
            } catch (parseError) {
                console.error('Form parsing error:', parseError);
                return res.status(400).json({ 
                    success: false, 
                    message: 'Error parsing form data: ' + parseError.message 
                });
            }
        }
        
        // Handle /api/tools endpoint (GET approved tools)
        if (req.method === 'GET') {
            // Get all approved tools
            const { data: tools, error } = await supabase
                .from('ai_tools')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error fetching tools' 
                });
            }

            // Transform Supabase data to match frontend format
            const transformedTools = tools.map(tool => ({
                id: tool.id,
                name: tool.tool_name,
                description: tool.tool_description,
                category: tool.tool_category,
                url: tool.tool_url,
                image: tool.tool_image,
                pricing: tool.pricing_type,
                features: tool.tool_tags || [],
                tags: tool.tool_tags || [],
                rating: tool.rating || 1,
                date_added: tool.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                approved: tool.status === 'approved',
                verified: tool.verified || false
            }));

            return res.json({ success: true, tools: transformedTools });
        }

        // If no method matches
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });

    } catch (error) {
        console.error('Error in tools API:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}
