# AI Tools Hub - Database Setup Guide

## Supabase Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and set project details:
   - Name: `ai-tools-hub`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait for the project to be created (usually takes 2-3 minutes)

### 2. Database Schema Setup

Once your project is ready, go to the SQL Editor in your Supabase dashboard and run this SQL to create the database structure:

```sql
-- Create the ai_tools table
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(100) NOT NULL,
    tool_url VARCHAR(500) NOT NULL,
    tool_description TEXT NOT NULL,
    tool_category VARCHAR(50) NOT NULL,
    tool_tags TEXT[], -- Array of tags
    tool_image VARCHAR(500),
    pricing_type VARCHAR(20) NOT NULL CHECK (pricing_type IN ('Free', 'Freemium', 'Pro')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    contributor_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_tools_category ON ai_tools(tool_category);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_verified ON ai_tools(verified);
CREATE INDEX idx_ai_tools_rating ON ai_tools(rating);
CREATE INDEX idx_ai_tools_pricing ON ai_tools(pricing_type);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_tools_updated_at 
    BEFORE UPDATE ON ai_tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO ai_tools (tool_name, tool_url, tool_description, tool_category, tool_tags, tool_image, pricing_type, rating, status, verified) VALUES
('ChatGPT', 'https://chat.openai.com', 'Advanced AI assistant that can answer questions, write content, solve problems, and engage in natural conversations.', 'Writing', ARRAY['Writing', 'Productivity', 'Conversation'], 'https://images.unsplash.com/photo-1655720048598-02413ccd8094?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80', 'Freemium', 5, 'approved', true),
('Midjourney', 'https://midjourney.com', 'Create stunning AI-generated artwork with simple text prompts. Perfect for designers, marketers, and creative professionals.', 'Design', ARRAY['Design', 'Creative', 'Pro'], 'https://images.unsplash.com/photo-1677442135146-9bab59b7a31c?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80', 'Pro', 4, 'approved', true),
('DALL-E', 'https://openai.com/dall-e', 'AI system that creates realistic images and art from natural language descriptions. Generate unique visuals from text prompts.', 'Design', ARRAY['Design', 'Creative'], 'https://images.unsplash.com/photo-1678391800460-5e1dbafada38?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80', 'Freemium', 4, 'approved', true),
('Notion AI', 'https://notion.so/product/ai', 'AI writing assistant integrated into Notion, helping you write faster, summarize content, and generate new ideas.', 'Productivity', ARRAY['Writing', 'Productivity', 'Summarization'], 'https://images.unsplash.com/photo-1625014618611-fb1224f4abce?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80', 'Freemium', 4, 'approved', true),
('Grammarly', 'https://grammarly.com', 'AI-powered writing assistant that helps you write clear, mistake-free text. Checks grammar, spelling, tone, and clarity.', 'Writing', ARRAY['Writing', 'Grammar', 'Education'], 'https://images.unsplash.com/photo-1684163020534-5954db5d9824?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=700&q=80', 'Freemium', 5, 'approved', true);
```

### 3. Row Level Security (RLS) Setup

Set up security policies to protect your data:

```sql
-- Enable RLS on the ai_tools table
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- Policy for reading approved tools (public access)
CREATE POLICY "Anyone can view approved tools" ON ai_tools
    FOR SELECT USING (status = 'approved');

-- Policy for inserting new tools (public can submit)
CREATE POLICY "Anyone can insert tools" ON ai_tools
    FOR INSERT WITH CHECK (true);

-- Policy for updating tools (only authenticated users with proper role)
-- You can modify this based on your admin setup
CREATE POLICY "Only admins can update tools" ON ai_tools
    FOR UPDATE USING (false); -- Disable for now, set up admin roles later

-- Policy for deleting tools (only authenticated users with proper role)
CREATE POLICY "Only admins can delete tools" ON ai_tools
    FOR DELETE USING (false); -- Disable for now, set up admin roles later
```

### 4. Get API Keys

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Public Key**: `eyJ...` (long string starting with eyJ)

### 5. Configure Frontend

Replace the placeholder values in your JavaScript files:

#### In `js/list-tools.js`:
```javascript
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key-here';
```

#### In `js/contribute.js`:
```javascript
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key-here';
```

### 6. Install Supabase JavaScript Client

Add the Supabase client to your HTML files. Add this script tag before your custom JavaScript files:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 7. Update JavaScript to Use Real Supabase

Replace the mock implementations with real Supabase clients:

#### In `js/list-tools.js`, replace the mockSupabase section with:
```javascript
// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Update loadToolsFromDatabase function
async function loadToolsFromDatabase() {
    try {
        showLoadingState();
        
        const { data, error } = await supabaseClient
            .from('ai_tools')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allTools = data || [];
        filteredTools = [...allTools];
        
        hideLoadingState();
        renderTools();
        renderPagination();
        
    } catch (error) {
        console.error('Error loading tools:', error);
        showErrorState();
    }
}
```

#### In `js/contribute.js`, replace the mockSupabase section with:
```javascript
// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Update submitToDatabase function
async function submitToDatabase(data) {
    const { data: result, error } = await supabaseClient
        .from('ai_tools')
        .insert(data);
    
    return { data: result, error };
}
```

### 8. Test the Integration

1. Open your website
2. Go to the Contribute page and submit a test tool
3. Check your Supabase dashboard → Table Editor → ai_tools to see if the data was inserted
4. The tool should appear on the main tools page after you approve it (set status to 'approved')

### 9. Admin Panel (Optional)

For managing submitted tools, you can create a simple admin interface or use Supabase's built-in Table Editor:

1. **Using Supabase Dashboard**: Go to Table Editor → ai_tools to manually approve/reject submissions
2. **Custom Admin Panel**: Create an admin.html page with authentication to manage tools

### 10. Environment Variables (Production)

For production deployment, consider using environment variables:

```javascript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'your-fallback-url';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-fallback-key';
```

## Security Considerations

1. **Never expose your service role key** in frontend code
2. **Use Row Level Security** to control access to data
3. **Validate data** on both client and server side
4. **Rate limit submissions** to prevent spam
5. **Sanitize user inputs** to prevent XSS attacks

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your domain is added to Supabase's allowed origins
2. **RLS Blocking Queries**: Check your RLS policies if queries are being blocked
3. **API Key Issues**: Ensure you're using the anon/public key, not the service role key
4. **Network Errors**: Check if Supabase is accessible from your domain

### Testing Connection:

Add this to your browser console to test the connection:
```javascript
const { createClient } = supabase;
const client = createClient('YOUR_URL', 'YOUR_ANON_KEY');
client.from('ai_tools').select('count').then(console.log);
```

## Next Steps

1. Set up the database schema
2. Configure the API keys
3. Test the contribution form
4. Set up an admin workflow for approving tools
5. Consider adding user authentication for advanced features
6. Add analytics to track tool submissions and views

Your AI Tools Hub is now ready to accept real-time tool submissions from users and display them dynamically from the database!
