# 🔒 Security Best Practices

## ⚠️ CRITICAL: Token Management

### **NEVER Commit Tokens to Git!**

**DO NOT:**
- ❌ Put tokens directly in code files
- ❌ Commit `.env` files to repository
- ❌ Share tokens in pull requests
- ❌ Paste tokens in issues or discussions
- ❌ Screenshot code with tokens visible

**DO:**
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Use GitHub Secrets for Actions
- ✅ Use Vercel Environment Variables
- ✅ Rotate tokens if accidentally exposed
- ✅ Use minimal permissions (principle of least privilege)

---

## 🛡️ **Safe Token Usage**

### **1. Local Development**

Create `backend-github/.env`:
```env
GITHUB_TOKEN=ghp_your_token_here
WORKFLOW_REPO_OWNER=your-username
WORKFLOW_REPO_NAME=autofix-bot
PORT=3001
```

**The `.env` file is in `.gitignore` and will NEVER be committed!**

Verify it's ignored:
```powershell
git status
# .env should NOT appear in the list
```

---

### **2. GitHub Actions (Workflow Execution)**

Add secrets in your repository:

1. Go to: `https://github.com/YOUR_USERNAME/autofix-bot/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these secrets:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `GITHUB_TOKEN` - Auto-provided by GitHub (no action needed)

**GitHub Secrets are encrypted and never exposed in logs.**

---

### **3. Vercel Deployment**

**Option A: Vercel CLI**
```bash
vercel env add GITHUB_TOKEN
vercel env add GEMINI_API_KEY
vercel env add WORKFLOW_REPO_OWNER
vercel env add WORKFLOW_REPO_NAME
```

**Option B: Vercel Dashboard**
1. Go to: `https://vercel.com/your-username/autofix-bot/settings/environment-variables`
2. Add each variable:
   - **Key**: `GITHUB_TOKEN`
   - **Value**: `ghp_your_token_here`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

---

## 🔐 **GitHub Token Permissions**

When creating your GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select **ONLY** these scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
4. **DO NOT** select:
   - ❌ `admin:org` - Too broad
   - ❌ `delete_repo` - Dangerous
   - ❌ `admin:gpg_key` - Unnecessary

**Principle**: Only grant minimal permissions needed!

---

## 🚨 **If You Accidentally Expose a Token**

### **Immediate Actions:**

1. **Revoke the token immediately:**
   - Go to: https://github.com/settings/tokens
   - Click **"Delete"** next to the exposed token

2. **Generate a new token:**
   - Create new token with same permissions
   - Update `.env` file locally
   - Update GitHub Secrets
   - Update Vercel Environment Variables

3. **Check for unauthorized access:**
   - Go to: https://github.com/settings/security-log
   - Look for suspicious activity

4. **Rotate Gemini key if exposed:**
   - Go to: https://aistudio.google.com/app/apikey
   - Revoke compromised key
   - Generate new key

---

## ✅ **Security Checklist**

Before pushing to GitHub:

```powershell
# Verify .env is ignored
git status
# Should NOT show .env files

# Check for accidentally committed secrets
git log -p | Select-String -Pattern "ghp_|sk-"
# Should return NO results

# Verify .gitignore includes .env
Get-Content .gitignore | Select-String ".env"
# Should show: .env, .env.local, etc.
```

---

## 🔒 **Additional Security Measures**

### **1. Enable 2FA on GitHub**
- Go to: https://github.com/settings/security
- Enable two-factor authentication

### **2. Use Fine-Grained Tokens (Alternative)**
Instead of classic tokens, use fine-grained tokens:
- Go to: https://github.com/settings/tokens?type=beta
- More granular permissions
- Repository-specific access

### **3. Set Token Expiration**
- Don't use tokens with no expiration
- Rotate tokens every 90 days
- Use shorter expiration for testing (7-30 days)

### **4. Monitor Usage**
- Check GitHub audit log regularly
- Review Vercel deployment logs
- Monitor OpenAI API usage dashboard

---

## 📚 **Official Documentation**

- [GitHub Token Security](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [OpenAI API Key Safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)

---

## ❓ **FAQ**

### **Q: Can I commit `.env.example`?**
✅ **Yes!** Example files without real values are safe:
```env
GITHUB_TOKEN=ghp_your_token_here
GEMINI_API_KEY=your_key_here
```

### **Q: Is it safe to share my GitHub repo if it's public?**
✅ **Yes**, IF:
- `.env` files are in `.gitignore`
- You use GitHub Secrets for Actions
- You use Vercel Environment Variables for deployment
- You never committed real tokens

❌ **No**, IF:
- You ever committed `.env` with real tokens
- You hardcoded tokens in source files

### **Q: What if someone sees my token in my terminal?**
🚨 **Rotate it immediately!** Treat it as compromised.

### **Q: Can GitHub staff see my Secrets?**
✅ No - GitHub Secrets are encrypted and GitHub staff cannot access them.

### **Q: Should I encrypt my `.env` file?**
Not necessary if:
- It's in `.gitignore`
- Your computer has full-disk encryption
- You don't share screen with `.env` open

---

## 🎯 **Summary**

**3 Golden Rules:**
1. **Never commit tokens to Git**
2. **Always use environment variables**
3. **Rotate tokens if exposed**

**Safe Storage Locations:**
- Local: `.env` files (gitignored)
- GitHub: Repository Secrets
- Vercel: Environment Variables Dashboard

**Your public repository is safe as long as tokens are in the right places!** ✅

---

**Questions?** Check the [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/best-practices-for-securing-your-github-account) guide.

**Stay secure! 🔒**
