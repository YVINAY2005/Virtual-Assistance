# Fix: Gemini API 403 Forbidden Error

## Problem
Your Gemini API key is invalid or has been revoked, causing a **403 Forbidden** error.

## Solution: Get a New Gemini API Key

### Step 1: Go to Google AI Studio
1. Open your browser and go to: https://aistudio.google.com/
2. Sign in with your Google account

### Step 2: Create or Get API Key
1. Click on **"Get API Key"** button (usually in the top-left or menu)
2. Select **"Create API Key"** 
3. Choose **"Create API Key in new project"** or use existing project
4. Copy the generated API key (it will look like: `AIza...`)

### Step 3: Update Your .env File
1. Open `backend/.env` file
2. Find the line with `GEMINI_API_URL`
3. Replace the old key with your new key

**Current (INVALID):**
```
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDPQBN3p_mCCNeQ-npRfYCZHkU1H1C0yf4"
```

**New format (replace YOUR_NEW_KEY):**
```
GEMINI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_NEW_API_KEY"
```

### Step 4: Restart the Server
1. Stop the backend server (Ctrl+C in terminal)
2. Run `npm run dev` again
3. Test by saying a voice command

## Optional: Enable Gemini API
If the key is new, you may need to enable the Generative Language API:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Search for "Generative Language API"
3. Click "Enable"

## Alternative: Use a Different Model
If you want to use a different Gemini model, you can change:
- `gemini-2.5-flash` → `gemini-pro`
- `gemini-2.5-flash` → `gemini-1.5-flash`
