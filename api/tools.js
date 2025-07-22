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
        
        // Handle /api/tools/submit endpoint
        if (req.method === 'POST') {
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

            return res.json({ 
                success: true, 
                message: 'Tool submitted successfully! It will be reviewed by our team.',
                toolId: tool.id
            });
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

        if (req.method === 'POST') {
            // Submit a new tool
            const {
                name,
                description,
                url,
                category,
                pricing,
                features,
                tags,
                imageUrl,
                reelUrl,
                submitterName,
                submitterEmail
            } = req.body;

            // Basic validation
            if (!name || !description || !url || !category || !pricing) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Process features and tags
            const featuresList = features ? (typeof features === 'string' ? features.split(',').map(f => f.trim()) : features) : [];
            const tagsList = tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [];

            // Normalize pricing type to match database constraints
            const normalizePricing = (pricing) => {
                const pricingMap = {
                    'free': 'Free',
                    'freemium': 'Freemium', 
                    'paid': 'Pro',
                    'pro': 'Pro'
                };
                return pricingMap[pricing.toLowerCase()] || 'Free';
            };

            const normalizedPricing = normalizePricing(pricing);

            // Default image if none provided
            const imagePath = imageUrl || 'https://images.unsplash.com/photo-1677442135146-9bab59b7a31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80';

            // Insert into Supabase
            const { data: newTool, error: supabaseError } = await supabase
                .from('ai_tools')
                .insert({
                    tool_name: name,
                    tool_description: description,
                    tool_category: category,
                    tool_url: url,
                    tool_image: imagePath,
                    pricing_type: normalizedPricing,
                    tool_tags: [...featuresList, ...tagsList],
                    contributor_name: submitterName,
                    status: 'pending',
                    verified: false,
                    rating: 1
                })
                .select()
                .single();

            if (supabaseError) {
                console.error('Supabase error:', supabaseError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error submitting tool' 
                });
            }

            // If reel URL was provided, add to reels table
            if (reelUrl && newTool) {
                await supabase
                    .from('reels')
                    .insert({
                        tool_id: newTool.id,
                        tool_name: name,
                        url: reelUrl
                    });
            }

            return res.json({ 
                success: true, 
                message: 'Tool submitted successfully and pending review',
                toolId: newTool.id
            });
        }

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
