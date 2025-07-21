# AI Tools Website

A modern, responsive website showcasing AI tools with a contact form backend built with Node.js and Express.

## Features

- 🎨 Modern, responsive design
- 📱 Mobile-friendly interface
- 📧 Working contact form with email integration
- 🎥 Video hero section support
- ⚡ Fast loading with optimized assets
- 🔒 Secure form handling with validation

## Project Structure

```
ai-tools-website/
├── public/                 # Frontend assets
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   └── main.js        # Frontend JavaScript
│   ├── assets/            # Images, videos, etc.
│   └── index.html         # Main HTML file
├── server.js              # Express server
├── package.json           # Dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your email credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=your-contact-email@gmail.com
PORT=3000
```

**Note:** For Gmail, you need to generate an "App Password":
1. Go to Google Account Settings > Security > 2-Step Verification
2. Generate a new app password
3. Use that password in `EMAIL_PASS`

### 3. Add Your Video

Place your AI robot animation video in `public/assets/ai-robot-animation.mp4`

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Visit Your Site

Open http://localhost:3000 in your browser

## Email Configuration

The contact form uses Nodemailer with Gmail. You can easily switch to other email providers by modifying the transporter configuration in `server.js`.

### Supported Email Services:
- Gmail
- Outlook
- Yahoo
- Custom SMTP servers

## Customization

### Styling
- Edit `public/css/style.css` to customize the appearance
- CSS variables are defined at the top for easy theme changes

### Content
- Modify `public/index.html` for content changes
- Update social media links in the footer

### Functionality
- Add new routes in `server.js`
- Extend frontend functionality in `public/js/main.js`

## Deployment

### Vercel (Recommended)

#### Prerequisites:
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at [vercel.com](https://vercel.com)

#### Deploy Steps:

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Set Environment Variables:**
   In your Vercel dashboard or via CLI:
   ```bash
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS  
   vercel env add CONTACT_EMAIL
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```
   Or simply:
   ```bash
   vercel --prod
   ```

#### Environment Variables for Vercel:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password
- `CONTACT_EMAIL`: Email address to receive contact form submissions

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy with Git

### Netlify (Static + Serverless Functions)
1. Deploy the `public` folder to Netlify
2. Convert contact form to Netlify Functions

## API Endpoints

- `GET /` - Serves the main page
- `POST /api/contact` - Handles contact form submissions

## Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Email:** Nodemailer
- **Styling:** Custom CSS with CSS Grid/Flexbox
- **Icons:** Material Icons

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Created by @pranaykumar2

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
