# MongoDB Atlas IP Whitelist Setup Guide

## 🔒 Current Issue: IP Address Not Whitelisted

Your MongoDB Atlas cluster is blocking connections because your current IP address is not in the allowed list.

## ✅ Quick Fix Steps:

### Option 1: Add Your Current IP (Recommended)

1. **Open MongoDB Atlas**: https://cloud.mongodb.com
2. **Sign in** with your account
3. **Click "Network Access"** in the left sidebar (under Security)
4. **Click the green "Add IP Address" button**
5. **Click "Add Current IP Address"** - This automatically detects your IP
6. **Click "Confirm"**
7. **Wait 1-2 minutes** for the change to propagate
8. **Restart your server** (`npm run dev`)

### Option 2: Allow All IPs (Development Only - Less Secure)

1. **Open MongoDB Atlas**: https://cloud.mongodb.com
2. **Sign in** with your account
3. **Click "Network Access"** in the left sidebar
4. **Click "Add IP Address"**
5. **Enter**: `0.0.0.0/0` (allows all IP addresses)
6. **Add comment**: "Development - Allow all"
7. **Click "Confirm"**
8. **Wait 1-2 minutes**
9. **Restart your server**

## 📸 Visual Guide:

```
MongoDB Atlas Dashboard
    ↓
Security (left sidebar)
    ↓
Network Access
    ↓
[Add IP Address] button
    ↓
[Add Current IP Address] OR Enter "0.0.0.0/0"
    ↓
[Confirm]
```

## ⏱️ After Whitelisting:

1. Wait 1-2 minutes for MongoDB Atlas to update
2. Restart your server: `npm run dev`
3. You should see:
   ```
   ✅ MongoDB connected successfully!
   📊 Database: job_portal
   ```

## 🔍 Verify Your Connection String:

Make sure your `.env` file has:
```
MONGODB_URI=mongodb+srv://abnerabraham51_db_user:102239abnerr@cluster0.lhu7t2c.mongodb.net/job_portal?appName=Cluster0
```

## ❓ Still Having Issues?

- Make sure you're signed into the correct MongoDB Atlas account
- Check that you're whitelisting IPs for the correct cluster (Cluster0)
- Try using `0.0.0.0/0` temporarily to test if it's an IP detection issue
- Wait a few minutes after whitelisting - changes can take time to propagate



