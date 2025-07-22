const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Use service key for server-side operations
);

// Database path (using JSON file for fallback)
const TOOLS_DB_PATH = path.join(__dirname, 'data', 'tools.json');
const REELS_DB_PATH = path.join(__dirname, 'data', 'reels.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Create uploads directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public', 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'public', 'uploads'));
}

// Create empty database files if they don't exist
if (!fs.existsSync(TOOLS_DB_PATH)) {
    fs.writeFileSync(TOOLS_DB_PATH, JSON.stringify([]));
}

if (!fs.existsSync(REELS_DB_PATH)) {
    fs.writeFileSync(REELS_DB_PATH, JSON.stringify([]));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure nodemailer (you'll need to set up your email credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your app password
    }
});

// Helper function to read database files
function readDatabase(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading database: ${error}`);
        return [];
    }
}

// Helper function to write to database files
function writeDatabase(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to database: ${error}`);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get all tools
app.get('/api/tools', async (req, res) => {
    try {
        // Try to fetch from Supabase first
        const { data: tools, error } = await supabase
            .from('ai_tools')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            // Fallback to JSON file
            const tools = readDatabase(TOOLS_DB_PATH);
            return res.json({ success: true, tools });
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
            rating: tool.rating || 0,
            date_added: tool.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            approved: tool.status === 'approved',
            verified: tool.verified || false
        }));

        res.json({ success: true, tools: transformedTools });
    } catch (error) {
        console.error('Error fetching tools:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tools' 
        });
    }
});

// API endpoint to submit a new tool
app.post('/api/tools', upload.single('image'), async (req, res) => {
    try {
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

        // Process image path
        let imagePath;
        if (req.file) {
            // If image was uploaded
            imagePath = `/uploads/${req.file.filename}`;
        } else if (imageUrl) {
            // If image URL was provided
            imagePath = imageUrl;
        } else {
            // Default image if none provided
            imagePath = 'https://images.unsplash.com/photo-1677442135146-9bab59b7a31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80';
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

        // Try to insert into Supabase first
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
                status: 'pending', // New tools need approval
                verified: false,
                rating: 1 // Set minimum rating to 1 to satisfy CHECK constraint
            })
            .select()
            .single();

        if (supabaseError) {
            console.error('Supabase error:', supabaseError);
            // Fallback to JSON file method
            return handleJSONSubmission(req, res);
        }

        // If reel URL was provided, add to reels table (future feature)
        if (reelUrl && newTool) {
            await supabase
                .from('reels')
                .insert({
                    tool_id: newTool.id,
                    tool_name: name,
                    url: reelUrl
                });
        }

        // Send notification email to admin
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: `New Tool Submission: ${name}`,
            html: `
                <h2>New Tool Submission</h2>
                <p><strong>Tool Name:</strong> ${name}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Pricing:</strong> ${pricing}</p>
                <p><strong>URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
                <p><strong>Description:</strong></p>
                <p>${description}</p>
                <p><strong>Submitted By:</strong> ${submitterName} (${submitterEmail})</p>
                <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}/admin/submissions.html">Review this submission</a></p>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the submission if email fails
        }

        res.json({ 
            success: true, 
            message: 'Tool submitted successfully and pending review',
            toolId: newTool.id
        });

    } catch (error) {
        console.error('Error submitting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error submitting tool'
        });
    }
});

// Fallback function for JSON file submission
async function handleJSONSubmission(req, res) {
    const {
        name, description, url, category, pricing, features, tags,
        imageUrl, reelUrl, submitterName, submitterEmail
    } = req.body;
    
    // Get existing tools
    const tools = readDatabase(TOOLS_DB_PATH);
    const id = uuidv4();
    
    let imagePath;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
        imagePath = imageUrl;
    } else {
        imagePath = '/images/default-tool.jpg';
    }
    
    const featuresList = features ? features.split(',') : [];
    const tagsList = tags ? tags.split(',') : [];
    
    const newTool = {
        id,
        name,
        description,
        category,
        url,
        image: imagePath,
        pricing,
        features: featuresList,
        tags: tagsList,
        rating: 0,
        date_added: new Date().toISOString().split('T')[0],
        submitter: {
            name: submitterName,
            email: submitterEmail
        },
        approved: false
    };
    
    tools.push(newTool);
    writeDatabase(TOOLS_DB_PATH, tools);
    
    if (reelUrl) {
        const reels = readDatabase(REELS_DB_PATH);
        const newReel = {
            id: uuidv4(),
            toolId: id,
            toolName: name,
            url: reelUrl,
            date_added: new Date().toISOString().split('T')[0]
        };
        reels.push(newReel);
        writeDatabase(REELS_DB_PATH, reels);
    }
    
    res.json({ 
        success: true, 
        message: 'Tool submitted successfully and pending review (JSON fallback)',
        toolId: id
    });
}

// API endpoint to get all reels
app.get('/api/reels', async (req, res) => {
    try {
        // Try Supabase first (future implementation)
        const { data: reels, error } = await supabase
            .from('reels')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase reels error:', error);
            // Fallback to JSON file
            const reels = readDatabase(REELS_DB_PATH);
            return res.json({ success: true, reels });
        }

        res.json({ success: true, reels: reels || [] });
    } catch (error) {
        console.error('Error fetching reels:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching reels' 
        });
    }
});

// Admin API endpoints
app.get('/api/admin/tools', async (req, res) => {
    try {
        const { data: tools, error } = await supabase
            .from('ai_tools')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, tools: tools || [] });
    } catch (error) {
        console.error('Error fetching admin tools:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching tools' 
        });
    }
});

app.get('/api/admin/submissions', async (req, res) => {
    try {
        const { data: submissions, error } = await supabase
            .from('ai_tools')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, submissions: submissions || [] });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching submissions' 
        });
    }
});

app.put('/api/admin/tools/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('ai_tools')
            .update({ 
                status: 'approved',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Tool approved successfully', tool: data });
    } catch (error) {
        console.error('Error approving tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error approving tool' 
        });
    }
});

app.put('/api/admin/tools/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const { data, error } = await supabase
            .from('ai_tools')
            .update({ 
                status: 'rejected',
                rejection_reason: reason || 'No reason provided',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Tool rejected successfully', tool: data });
    } catch (error) {
        console.error('Error rejecting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error rejecting tool' 
        });
    }
});

app.delete('/api/admin/tools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await supabase
            .from('ai_tools')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Tool deleted successfully' });
    } catch (error) {
        console.error('Error deleting tool:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting tool' 
        });
    }
});

app.get('/api/admin/stats', async (req, res) => {
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

        res.json({
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
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics' 
        });
    }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all fields.' 
            });
        }

        // Email configuration
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Thank you for your message! We\'ll get back to you soon.' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error sending your message. Please try again.' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Contact form endpoint: http://localhost:${PORT}/api/contact`);
    console.log(`🔧 Tools API endpoint: http://localhost:${PORT}/api/tools`);
    console.log(`🎬 Reels API endpoint: http://localhost:${PORT}/api/reels`);
});

module.exports = app;