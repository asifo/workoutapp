# Google Cloud TTS Free Tier Setup Guide

This guide will help you set up **Google Cloud Text-to-Speech FREE tier** for your BJJ Workout App. The free tier includes **4 million characters per month** - more than enough for daily workouts!

## 🎯 **Free Tier Benefits**

- ✅ **4 Million Characters Per Month** (completely free!)
- ✅ **10 Standard Voices** to choose from
- ✅ **Much Better Quality** than browser speech synthesis
- ✅ **No Credit Card Required** for free tier
- ✅ **Automatic Fallback** to browser TTS if needed

## 📋 **Setup Steps**

### Step 1: Create a Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms of service
4. **No credit card required for free tier!**

### Step 2: Create a New Project

1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it something like "BJJ Workout TTS"
4. Click "Create"

### Step 3: Enable the Text-to-Speech API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Text-to-Speech API"
3. Click on it and press **Enable**

### Step 4: Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the generated API key (it will look like: `AIzaSyC...`)
4. **Optional**: Click "Restrict Key" and limit it to Text-to-Speech API only

### Step 5: Configure the App

1. Open your BJJ Workout App
2. Click the settings icon (gear) in the bottom right
3. Scroll down to "Google Cloud TTS (Free Tier)" section
4. Check "Use Google Cloud TTS (Better Quality - FREE)"
5. Paste your API key in the "API Key" field
6. Select your preferred voice from the dropdown
7. Click "Save TTS Settings"
8. Click "Test Google TTS" to verify it works

## 🎵 **Available Voices (All Free!)**

### Female Voices:
- **Standard Female A** - Clear and professional
- **Standard Female C** - Warm and friendly
- **Standard Female E** - Energetic and motivating
- **Standard Female F** - Calm and soothing
- **Standard Female H** - Strong and confident

### Male Voices:
- **Standard Male B** - Deep and authoritative
- **Standard Male D** - Clear and instructional
- **Standard Male G** - Energetic and motivating
- **Standard Male I** - Professional and clear
- **Standard Male J** - Warm and encouraging

## 💰 **Free Tier Limits**

- **4 Million Characters Per Month**
- **Resets on the 1st of each month**
- **No cost for Standard voices**
- **Automatic usage tracking** in the app

### Usage Examples:
- **Typical workout session**: ~500 characters
- **Daily workouts**: ~15,000 characters/month
- **Free tier allows**: ~8,000 workout sessions/month!

## 🔧 **Troubleshooting**

### "Invalid API key format"
- Make sure your API key is at least 30 characters long
- Check that you copied the entire key correctly
- API keys start with "AIza"

### "Google TTS test failed"
- Verify your API key is correct
- Check that Text-to-Speech API is enabled
- Ensure you're using the correct project
- Check your internet connection

### "Monthly free tier limit reached"
- This means you've used all 4M characters
- Wait until the 1st of next month for reset
- Or upgrade to paid tier if needed

### "API key not found"
- Make sure you've entered the API key in the settings
- Check that you saved the settings
- Try refreshing the page

## 📊 **Usage Monitoring**

The app automatically tracks your usage and shows:
- Characters used this month
- Characters remaining
- Visual progress bar
- Reset date information

## 🔒 **Security Notes**

- API keys are stored locally in your browser
- Never share your API key publicly
- Consider restricting the API key to Text-to-Speech only
- Monitor usage in Google Cloud Console

## 🆘 **Need Help?**

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Cloud setup
3. Test with a simple API call
4. Check the Google Cloud Console for usage logs

## 🎉 **That's It!**

Once configured, your app will automatically use Google Cloud TTS for much better voice quality during workouts. The free tier should be more than sufficient for daily use, and you'll get professional-quality voice announcements for your BJJ training sessions! 