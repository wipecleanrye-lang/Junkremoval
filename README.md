# Clean Up Junk Removal Website

Professional multi-page website for GitHub Pages.

## Business

Clean Up Junk Removal  
Junk Removal • Exterior Window Cleaning • Exterior Pressure Washing  
Serving Rye, Westchester, Greenwich CT & nearby areas  
Phone: 914-306-3677

## Payments

Zelle • Venmo • Checks • Cash

## Pages

- index.html
- junk-removal.html
- window-cleaning.html
- power-washing.html
- pricing.html
- contact.html

## Publish

Settings → Pages → Deploy from branch → main → /root → Save


## Advanced quote system

The website now uses:
- `contact.html` for the full quote request flow
- `advanced-site.css` for the advanced quote page and trust sections
- `advanced-quote.js` for form validation, photo compression, preview, priority detection, and Google Apps Script submission
- `backend-config.js` for the Google Apps Script web app URL

After Apps Script backend changes, redeploy the web app from:
Deploy → Manage deployments → Edit → New version → Deploy
