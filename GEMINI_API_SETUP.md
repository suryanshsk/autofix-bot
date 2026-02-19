# 🔑 Getting Your FREE Google Gemini API Key

## Why Gemini Instead of OpenAI?

✅ **FREE** - No credit card required!  
✅ **15 RPM** (Requests Per Minute) on free tier  
✅ **1 million tokens/day** for Gemini 1.5 Flash  
✅ **Same quality** - Great for error classification  
✅ **No expiration** - Free tier doesn't expire

**OpenAI Comparison:**
- ❌ OpenAI requires credit card
- ❌ GPT-4: $0.01-0.03 per 1K tokens
- ❌ Can get expensive quickly

---

## 🚀 Get Your Gemini API Key (2 Minutes)

### Step 1: Visit Google AI Studio
Go to: **https://aistudio.google.com/app/apikey**

### Step 2: Sign In
- Use your Google account (Gmail)
- Accept terms of service

### Step 3: Create API Key
1. Click **"Get API key"** or **"Create API key"**
2. Select **"Create API key in new project"** (recommended)
3. Copy the API key (starts with `AIza...`)

**Example key format:**
```
AIzaSyDhQ8X_example_key_here_1234567890
```

### Step 4: Save It Securely
**For Local Development:**
```powershell
cd backend-github
# Edit .env file
notepad .env
```

Add this line:
```env
GEMINI_API_KEY=AIzaSyDhQ8X_your_actual_key_here
```

**For GitHub Actions:**
1. Go to: `https://github.com/YOUR_USERNAME/autofix-bot/settings/secrets/actions`
2. Click **"New repository secret"**
3. Name: `GEMINI_API_KEY`
4. Value: Your key (paste it)
5. Click **"Add secret"**

---

## 📊 Free Tier Limits

| Feature | Gemini 2.0 Flash (FREE) |
|---------|-------------------------|
| **Rate Limit** | 15 requests/minute |
| **Daily Quota** | 1,500 requests/day |
| **Token Limit** | 1 million tokens/day |
| **Input Length** | Up to 1M tokens |
| **Cost** | **$0 Forever** |

**Perfect for our use case!**
- Each agent run = 5-10 API calls
- Can heal **~1500 repositories per day** on free tier!

---

## ⚙️ Models Available

We use **`gemini-2.0-flash-exp`** because:
- ✅ Latest and fastest model (Feb 2026)
- ✅ FREE tier available
- ✅ Excellent for structured tasks
- ✅ 1M context window
- ✅ Improved reasoning capabilities

**Other options:**
- `gemini-1.5-flash` - Stable version
- `gemini-1.5-pro` - More powerful (8K RPD free)
- `gemini-1.0-pro` - Older version (60 RPM free)

---

## 🧪 Test Your API Key

```powershell
# Install Google Generative AI SDK
npm install @google/generative-ai

# Test in PowerShell
$env:GEMINI_API_KEY="AIzaSyDhQ8X_your_key_here"
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }] })
  .then(result => console.log('✅ API Key works!', result.response.text()))
  .catch(err => console.error('❌ Error:', err.message));
"
```

---

## 🔒 Security Notes

**DO NOT:**
- ❌ Commit API key to GitHub
- ❌ Share API key publicly
- ❌ Hardcode in source files

**DO:**
- ✅ Store in `.env` files (gitignored)
- ✅ Use GitHub Secrets for Actions
- ✅ Use Vercel Environment Variables
- ✅ Rotate if exposed

---

## 🐛 Troubleshooting

### Error: "API key not valid"
- Check key starts with `AIza`
- No spaces before/after key
- Key is active in Google AI Studio

### Error: "Resource exhausted"
- You hit free tier limit
- Wait 1 minute (rate limit)
- Or wait until next day (daily quota)

### Error: "Model not found"
- Use `gemini-1.5-flash` (correct name)
- Not `gpt-4` or `gemini-flash`

---

## 📚 Official Documentation

- **Get API Key**: https://aistudio.google.com/app/apikey
- **Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Node.js SDK**: https://www.npmjs.com/package/@google/generative-ai

---

## 💡 Pro Tips

1. **Create separate API keys** for different projects
2. **Monitor usage** at https://aistudio.google.com
3. **Set up billing alerts** if you upgrade to paid
4. **Use Flash model** for speed (Pro for accuracy)
5. **Cache common prompts** to reduce API calls

---

## 🎯 Quick Setup Commands

```powershell
# 1. Get API key from Google AI Studio
Start-Process "https://aistudio.google.com/app/apikey"

# 2. Set it locally
cd backend-github
'GEMINI_API_KEY=your_key_here' | Out-File .env -Append

# 3. Install dependencies
cd ../agent-runner
npm install

# 4. Test it
$env:GEMINI_API_KEY="your_key_here"
npm start
```

---

## ✅ Verification Checklist

Before running the agent:

- [ ] API key obtained from Google AI Studio
- [ ] Key starts with `AIza`
- [ ] Added to `backend-github/.env` locally
- [ ] Added to GitHub Secrets (`GEMINI_API_KEY`)
- [ ] `.env` file is in `.gitignore`
- [ ] Tested with simple API call

---

**You're all set! 🎉**

Your AutoFix Bot now runs on **100% FREE infrastructure**:
- ✅ GitHub Actions (2,000 minutes/month free)
- ✅ Google Gemini (1,500 requests/day free)
- ✅ Vercel Hosting (free tier)

**Total cost: $0/month!** 💰
