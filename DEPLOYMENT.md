# Vercel Deployment Checklist

## Pre-deployment Steps

- [ ] Ensure all dependencies are listed in `package.json`
- [ ] Test the application locally with `npm start`
- [ ] Verify contact form works locally
- [ ] Add your video file to `public/assets/`
- [ ] Update social media links in `public/index.html`

## Vercel Setup

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Initialize project: `vercel`

## Environment Variables

Set these in Vercel dashboard or via CLI:

- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASS` - Your Gmail app password  
- [ ] `CONTACT_EMAIL` - Where to receive contact forms

## Deployment

- [ ] Deploy: `vercel --prod`
- [ ] Test the live site
- [ ] Test contact form on live site
- [ ] Verify video loads correctly

## Post-deployment

- [ ] Update any hardcoded URLs
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring (optional)

## Troubleshooting

### Common Issues:

1. **Contact form not working:**
   - Check environment variables are set
   - Verify Gmail app password is correct
   - Check Vercel function logs

2. **Video not loading:**
   - Ensure video file is in `public/assets/`
   - Check file size (Vercel has limits)
   - Verify file format is supported

3. **CSS/JS not loading:**
   - Check file paths are correct
   - Verify `vercel.json` routing is correct

### Vercel Commands:

- `vercel` - Deploy to preview
- `vercel --prod` - Deploy to production
- `vercel logs` - View function logs
- `vercel env ls` - List environment variables
