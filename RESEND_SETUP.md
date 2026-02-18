# Resend Setup and Deployment Guide

To get the email system working on Render, follow these steps:

## 1. Get a Resend API Key
1. Sign up/Log in at [resend.com](https://resend.com).
2. Go to **API Keys** in the sidebar.
3. Click **Create API Key**.
4. Give it a name (e.g., "The Cage Production") and select **Full Access**.
5. Copy the key (it starts with `re_`).

## 2. Update Render Environment Variables
In your Render Dashboard (**Recruitment-BACK** service):
1. Go to **Environment**.
2. **Add/Update** the following variables:
   - `RESEND_API_KEY`: `your_re_key_here`
   - `MAIL_FROM`: `onboarding@resend.dev` (Keep this for testing until you verify a domain).
3. **Remove** (if present):
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_SECURE`

## 3. Deploy the Changes
Since I have already updated the code, you just need to push the changes:
1. Open your terminal in the project folder.
2. Run these commands:
   ```bash
   git add .
   git commit -m "feat: switch from SMTP to Resend for reliable delivery"
   git push
   ```
3. Render will automatically detect the push and start a new build.

## 4. Verify
After the build is successful, check the Render logs. You should see:
`✅ Resend configuration found`
`🚀 Server started successfully!`
