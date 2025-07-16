# Google Cloud TTS with JSON Service Account Setup

This guide shows you how to use a Google Cloud service account JSON file with your BJJ workout app for Text-to-Speech.

## Option 1: API Key (Recommended for Client-Side Apps)

**Easiest method** - Use an API key instead of a JSON file:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new API key
3. Enable the Text-to-Speech API
4. Use the API key in the app settings

## Option 2: Service Account JSON File

If you have a service account JSON file, here's how to use it:

### ⚠️ Important Security Note

**Service account JSON files contain sensitive credentials and should NOT be used in client-side applications for security reasons.** The private key in the JSON file should never be exposed in browser code.

### For Development/Testing Only

If you want to test with a JSON file:

1. **Upload your JSON file:**
   - In the app settings, select "Service Account JSON" 
   - Click "Choose File" and select your JSON file
   - The app will validate and store it locally

2. **JSON file format should look like:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40project.iam.gserviceaccount.com"
}
```

### Production Recommendation

For production applications, use one of these secure approaches:

1. **API Key (Simplest):**
   - Create an API key with restricted access
   - Enable only the Text-to-Speech API
   - Set usage quotas to prevent abuse

2. **Backend Proxy (Most Secure):**
   - Keep the JSON file on your server
   - Create a backend API that handles TTS requests
   - Your frontend app calls your backend, which calls Google Cloud

3. **Environment Variables:**
   - Store credentials as environment variables
   - Use a build process to inject them securely

## Free Tier Usage

- **4 million characters per month** included in free tier
- Standard voices are cheaper than premium voices
- Usage is tracked automatically in the app
- Reset monthly

## Troubleshooting

### "Service account authentication not supported"
This is expected - the app will show this message because service account authentication requires backend support for security reasons.

### "Invalid service account JSON file"
Make sure your JSON file:
- Is valid JSON format
- Contains all required fields (type, project_id, private_key, client_email, etc.)
- Is from a Google Cloud service account with Text-to-Speech API enabled

### "Failed to parse JSON file"
- Check that the file is actually a JSON file
- Ensure the file isn't corrupted
- Try opening it in a text editor to verify format

## Security Best Practices

1. **Never commit JSON files to version control**
2. **Use API keys for client-side applications**
3. **Set up proper CORS and API restrictions**
4. **Monitor usage and set up billing alerts**
5. **Rotate credentials regularly**

## Getting Help

If you need help setting up Google Cloud TTS:
1. Check the [Google Cloud Text-to-Speech documentation](https://cloud.google.com/text-to-speech/docs)
2. Verify your project has the Text-to-Speech API enabled
3. Ensure your service account has the necessary permissions
4. Check that billing is enabled on your Google Cloud project 