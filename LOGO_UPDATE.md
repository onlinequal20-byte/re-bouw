# Logo Update

## Changes
The new logo (`amsbouwers.logo.png`) has been integrated across the entire application:

1. **Dashboard & Login**: 
   - Sidebar (Desktop & Mobile)
   - Login Page
   - Replaced old `Building2` icon with the new logo image.

2. **PDF Documents (Invoices & Quotations)**:
   - Updated PDF generator to include the new logo in the header.
   - The logo is read from the server filesystem and embedded into the PDF.

3. **Emails**:
   - Updated email templates to display the new logo.
   - The logo is linked using the `NEXT_PUBLIC_BASE_URL`.

## Important Note
For the logo to appear correctly in emails, ensure your `NEXT_PUBLIC_BASE_URL` environment variable is set to your production domain (e.g., `https://amsbouwers.nl` or your Vercel URL) in Vercel project settings.
If not set, it attempts to fallback to the Vercel deployment URL.

