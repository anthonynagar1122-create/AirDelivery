# Sarvam Voice Agents Integration

AirDelivery now uses **Sarvam Voice Agents (Samvaad)** for real-time voice conversations with Aira. This document explains how to set up and deploy the voice agent.

## Architecture

- **Frontend**: Sarvam Web SDK (`sarvam-conv-ai-sdk/browser`) runs real-time voice sessions in the browser with microphone capture
- **Backend**: Next.js API route (`/api/sarvam/signed-url/`) proxies the signed WebSocket URL fetch and holds the API key (never exposed to the client)
- **Agent**: Aira is configured in Sarvam Voice Agents with instructions, persona, and speaking style

## Setup Steps

### 1. Create the Aira Agent in Sarvam

1. Go to [Sarvam Voice Agents (Samvaad)](https://indus.sarvam.ai)
2. Create a new agent named **Aira** with these configurations:

**Greeting** (Hinglish):
```
Namaste! Main Aira hoon, AirDelivery se. Aaj main aapki kya help kar sakti hoon?
```

**Persona**:
```
You are Aira, the voice concierge for AirDelivery, a delivery service.
You are warm, upbeat and efficient, like a capable front-desk assistant who knows exactly what to do.
You address the customer by name when you have it. You keep conversations moving: you ask, you confirm, you act.
You are never robotic.
```

**Environment & Situation**:
```
The customer is a visitor on the AirDelivery website. They open a voice chat bubble on the site
and it turns into a live conversation with you. The website passes the visitor's name as user_name.
Sessions are short and spontaneous: many visitors are multitasking, so get to the point quickly
and confirm in small steps. Speak as if you are both in a relaxed office, with low background noise.
```

**Objective**:
```
Be the one conversation that sorts out the customer's whole delivery experience:

- Place a new delivery order, or repeat a previous order, after confirming the summary
- Check the status, dispatch, delivery partner and expected arrival of an existing order
- Modify or cancel an existing order, after confirming exactly what changes
- Handle queries and complaints with a three-step resolution: try to resolve it here,
  create a support ticket, or arrange a callback from the owner or team
- Submit order, ticket and callback notifications, and report their real delivery status—never a claimed one

End every call with a clear outcome and next step for the customer.
```

**Speaking Style Rules**:
- Be concise. No long preambles.
- Ask one thing at a time.
- Confirm before you act (order, cancel, etc).
- Say what you are doing and why.
- When you do not know, say so and offer an escalation.

3. Commit the agent (make it live for API calls)
4. Copy the **app_id** from the agent's "Deploy with Code" page

### 2. Configure Environment Variables

Create `.env.local` with:

```bash
# Sarvam Voice Agents API key (from https://indus.sarvam.ai/settings/api-key)
SARVAM_API_KEY=your_api_key_here

# Organization and workspace IDs (from your Sarvam account)
SARVAM_ORG_ID=01a20eae-91a4-79c7-afd3-30198a599673
SARVAM_WORKSPACE_ID=01a20eae-91ac-7601-a783-5461dd894cb2

# Aira agent app ID (from Sarvam agent settings)
NEXT_PUBLIC_SARVAM_APP_ID=Conversatio-090534dd-d6d8
```

**Important**: 
- `SARVAM_API_KEY` is **private** and should never be committed. It is used only on the backend.
- `NEXT_PUBLIC_SARVAM_APP_ID` is **public** and is passed to the browser.

### 3. Test the Integration

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click **"Talk to Aira"** → **"Speak"** button
4. Authorize microphone access when prompted
5. Say something like: **"I need milk and bread"**

### 4. How It Works

1. **User clicks "Speak"** → Browser requests microphone permission
2. **Browser fetches signed WebSocket URL** from `/api/sarvam/signed-url/` (backend holds the API key)
3. **Sarvam SDK opens WebSocket** and starts capturing mic audio
4. **Real-time voice session** runs between browser and Sarvam agent
5. **Transcript is passed back** as the user speaks and Aira responds
6. **Console displays both sides** of the conversation

## Deployment

### For Production

1. Add `SARVAM_API_KEY` to your hosting environment (Vercel, Cloud Run, etc.)
2. Ensure HTTPS is enabled (required for microphone access)
3. Test live voice on the production URL

### Network Security

- The API key is **never sent to the browser**
- The backend proxy (`/api/sarvam/signed-url/`) validates all requests before forwarding to Sarvam
- The signed WebSocket URL is single-use and time-limited

## Troubleshooting

### "Voice is not supported in this browser"
- Chrome, Edge, Firefox, and Safari (iOS 14.5+) all support Web Audio API
- Try a different browser

### Microphone not working
- Check browser permissions for microphone
- Ensure HTTPS is used (browsers block microphone on http://)
- Try another microphone device

### "Failed to get signed URL"
- Verify `SARVAM_API_KEY` is set correctly in `.env.local`
- Check that the app_id matches the one in Sarvam dashboard
- Ensure the agent has at least one committed version

### Agent not responding
- Check the agent is in "Ready" state in Sarvam dashboard
- Review agent logs in Sarvam (Samvaad) for errors
- Verify the agent instructions have no syntax errors

## References

- [Sarvam Voice Agents Docs](https://docs.sarvam.ai/voice-agents)
- [Web SDK Documentation](https://docs.sarvam.ai/voice-agents/deploy/sdks/web)
- [Sarvam Console / Samvaad](https://indus.sarvam.ai)
