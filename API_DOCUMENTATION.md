# AI Tools API Documentation

## Base URL
```
http://localhost:3000
```

## Public Endpoints

### 1. Get All Tools
**GET** `/api/tools`

Returns all approved tools from the database.

**Response:**
```json
{
  "success": true,
  "tools": [
    {
      "id": "uuid",
      "name": "Tool Name",
      "description": "Tool description",
      "category": "Category",
      "url": "https://tool-url.com",
      "image": "https://image-url.com/image.jpg",
      "pricing": "free|freemium|paid",
      "features": ["feature1", "feature2"],
      "tags": ["tag1", "tag2"],
      "rating": 4,
      "date_added": "2025-07-22",
      "approved": true,
      "verified": false
    }
  ]
}
```

### 2. Submit New Tool
**POST** `/api/tools`

Submit a new tool for approval.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tool Name",
  "description": "Tool description",
  "url": "https://tool-url.com",
  "category": "Education",
  "pricing": "free",
  "features": "feature1,feature2",
  "tags": "tag1,tag2",
  "imageUrl": "https://image-url.com/image.jpg",
  "reelUrl": "https://reel-url.com/video.mp4",
  "submitterName": "John Doe",
  "submitterEmail": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tool submitted successfully and pending review",
  "toolId": "uuid"
}
```

### 3. Get All Reels
**GET** `/api/reels`

Returns all reels from the database.

**Response:**
```json
{
  "success": true,
  "reels": [
    {
      "id": "uuid",
      "toolId": "uuid",
      "toolName": "Tool Name",
      "url": "https://reel-url.com",
      "date_added": "2025-07-22"
    }
  ]
}
```

### 4. Contact Form
**POST** `/api/contact`

Send a contact form message.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We'll get back to you soon."
}
```

## Admin Endpoints

### 5. Get Admin Dashboard Stats
**GET** `/api/admin/stats`

Returns statistics for the admin dashboard.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalTools": 5,
    "pendingSubmissions": 2,
    "avgRating": 4.2,
    "contributors": 3
  }
}
```

### 6. Get Categories Distribution
**GET** `/api/admin/categories`

Returns category distribution for charts.

**Response:**
```json
{
  "success": true,
  "distribution": [
    {
      "category": "Education",
      "count": 3,
      "percentage": "60.0"
    },
    {
      "category": "Design",
      "count": 2,
      "percentage": "40.0"
    }
  ],
  "categories": ["Education", "Design", "Productivity"]
}
```

### 7. Get All Admin Tools
**GET** `/api/admin/tools`

Returns all tools (approved and pending) for admin management.

**Response:**
```json
{
  "success": true,
  "tools": []
}
```
*Note: Currently returns empty as it's still using Supabase*

### 8. Get Pending Submissions
**GET** `/api/admin/submissions`

Returns all pending tool submissions from Supabase.

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": 10,
      "name": "Tool Name",
      "category": "Education",
      "description": "Tool description",
      "url": "https://tool-url.com",
      "image": "https://image-url.com/image.jpg",
      "pricing": "Free",
      "tags": ["tag1", "tag2"],
      "tool_name": "Tool Name",
      "tool_category": "Education",
      "tool_description": "Tool description",
      "tool_url": "https://tool-url.com",
      "tool_image": "https://image-url.com/image.jpg",
      "pricing_type": "Free",
      "tool_tags": ["tag1", "tag2"],
      "contributor_name": "John Doe",
      "contributor_email": "john@example.com",
      "status": "pending",
      "created_at": "2025-07-22T05:58:33.128103+00:00",
      "updated_at": "2025-07-22T05:58:33.128103+00:00"
    }
  ]
}
```

### 9. Approve Tool
**PUT** `/api/admin/tools/{id}/approve`

Approve a pending tool submission.

**URL Parameters:**
- `id` (string): The tool ID

**Response:**
```json
{
  "success": true,
  "message": "Tool approved successfully",
  "tool": {
    "id": "uuid",
    "name": "Tool Name",
    "approved": true,
    "updated_at": "2025-07-22T05:50:06.906Z"
  }
}
```

### 10. Reject Tool
**PUT** `/api/admin/tools/{id}/reject`

Reject a pending tool submission.

**URL Parameters:**
- `id` (string): The tool ID

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Reason for rejection"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tool rejected successfully",
  "tool": {
    "id": "uuid",
    "name": "Tool Name",
    "approved": false,
    "rejected": true,
    "rejection_reason": "Reason for rejection",
    "updated_at": "2025-07-22T05:50:06.906Z"
  }
}
```

### 11. Delete Tool
**DELETE** `/api/admin/tools/{id}`

Permanently delete a tool.

**URL Parameters:**
- `id` (string): The tool ID

**Response:**
```json
{
  "success": true,
  "message": "Tool deleted successfully"
}
```

### 12. Get Notifications
**GET** `/api/admin/notifications`

Returns admin notifications from the database.

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "tool_submission",
      "title": "New Tool Submission",
      "message": "New tool \"Tool Name\" submitted by John Doe",
      "tool_id": "uuid",
      "tool_name": "Tool Name",
      "submitter_name": "John Doe",
      "submitter_email": "john@example.com",
      "is_read": false,
      "created_at": "2025-07-22T05:58:33.128103+00:00",
      "read_at": null
    }
  ],
  "unreadCount": 1
}
```

### 13. Mark Notification as Read
**PUT** `/api/admin/notifications/{id}/read`

Mark a specific notification as read.

**URL Parameters:**
- `id` (string): The notification ID

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "id": "uuid",
    "is_read": true,
    "read_at": "2025-07-22T06:00:00.000Z"
  }
}
```

### 14. Mark All Notifications as Read
**PUT** `/api/admin/notifications/mark-all-read`

Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updatedCount": 3
}
```

## Test Data

### Sample Tool ID for Testing
Use these IDs for testing approve/reject/delete operations (from your Supabase data):
```
10  # Latest pending submission
9   # Prodigal son
8   # Protecta  
7   # tester
```

### Sample Tool Submission
```json
{
  "name": "Bruno Test Tool",
  "description": "A test tool submitted via Bruno API client",
  "url": "https://example.com",
  "category": "Testing",
  "pricing": "free",
  "features": "API Testing,Automation",
  "tags": "testing,api,bruno",
  "imageUrl": "https://images.unsplash.com/photo-1677442135146-9bab59b7a31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80",
  "submitterName": "Bruno Tester",
  "submitterEmail": "bruno@test.com"
}
```

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found (tool/endpoint not found)
- `500` - Internal Server Error

## Testing Workflow

1. **Test Server Status**: GET `/api/tools` to ensure server is running
2. **Submit a Tool**: POST `/api/tools` with sample data
3. **Check Submissions**: GET `/api/admin/submissions` to see pending tools
4. **Test Approval**: PUT `/api/admin/tools/{id}/approve` with tool ID
5. **Check Stats**: GET `/api/admin/stats` to see updated statistics
6. **Test Categories**: GET `/api/admin/categories` to see distribution

## Database Setup

### Notifications Table
Before using the notification system, create the notifications table in your Supabase database:

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    tool_id BIGINT REFERENCES ai_tools(id) ON DELETE SET NULL,
    tool_name VARCHAR(255),
    submitter_name VARCHAR(255),
    submitter_email VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on is_read for faster queries
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create an index on created_at for sorting
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create an index on type for filtering
CREATE INDEX idx_notifications_type ON notifications(type);
```

## Notes

- **✅ Full Supabase Integration**: All endpoints now use Supabase database exclusively
- **No JSON Fallback**: Local JSON files are no longer used as fallback
- File uploads are supported but not documented here (requires multipart/form-data)
- Make sure the server is running on `http://localhost:3000` before testing
- Ensure your Supabase credentials are properly configured in `.env` file
