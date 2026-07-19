# Kingsman Clock In/Out — Backend Integration Guide

## Quick Start (Local Demo)

The app works immediately as a local PWA. To test:

1. Open `index.html` in a browser on your phone or computer
2. Enter a Badge Number (e.g., "KG-001")
3. Allow GPS access when prompted
4. Tap "CLOCK IN" — the app captures your location and timestamp
5. Tap "CLOCK OUT" — the app runs auto-approval logic and logs the shift

**For demo purposes**, all data is stored locally in the browser. This is perfect for showing Vitus the contrast between the old paper system and the new digital flow.

---

## Google Sheets Integration (Phase 1 — Recommended)

This is the simplest backend. John and Graham already use spreadsheets.

### Setup Steps:

1. **Create a Google Sheet**
   - Name it "Kingsman Shift Log"
   - Add headers in Row 1:
     ```
     Shift ID | Badge | Action | Time In | Lat In | Lng In | Venue | Time Out | Lat Out | Lng Out | Approved | Reason | Submitted
     ```

2. **Enable Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project: "Kingsman Clock"
   - Enable the Google Sheets API
   - Create a Service Account
   - Download the JSON credentials file

3. **Share the Sheet**
   - Open your Google Sheet
   - Share it with the service account email (from the JSON file)
   - Give it "Editor" access

4. **Configure the App**
   - Open `config.js`
   - Set `SHEETS.enabled = true`
   - Paste your `spreadsheetId` (from the Sheet URL)
   - Paste the service account credentials

5. **Deploy a Proxy** (required for security)
   - The service account private key cannot live in client-side code
   - Options:
     - **Firebase Functions** (free tier available)
     - **Vercel Serverless** (free tier available)
     - **Google Apps Script** (simplest, no server needed)

### Option A: Google Apps Script (Simplest)

1. In your Google Sheet, go to Extensions → Apps Script
2. Paste this code:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  const row = [
    data.shift.id,
    data.shift.badgeId,
    data.action,
    data.shift.clockIn.time,
    data.shift.clockIn.lat,
    data.shift.clockIn.lng,
    data.shift.clockIn.venue ? data.shift.clockIn.venue.name : '',
    data.shift.clockOut ? data.shift.clockOut.time : '',
    data.shift.clockOut ? data.shift.clockOut.lat : '',
    data.shift.clockOut ? data.shift.clockOut.lng : '',
    data.shift.approval ? data.shift.approval.approved : '',
    data.shift.approval ? data.shift.approval.reason : '',
    data.timestamp,
  ];
  
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(
    JSON.stringify({ success: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New Deployment → Web App
   - Execute as: Me
   - Who has access: Anyone
4. Copy the Web App URL
5. Update `config.js`:
   ```javascript
   WEBHOOK: {
     enabled: true,
     url: 'YOUR_WEB_APP_URL',
     method: 'POST',
   }
   ```

---

## Airtable Integration (Alternative)

If John/Graham prefer a more visual interface:

1. Create an Airtable base with a "Shifts" table
2. Add fields matching the shift data structure
3. Use Airtable's API with an API key
4. Create a simple webhook proxy (same as above)

---

## Future: Phase 2 — SaaS Dashboard

When expanding to Venue Owners, build a proper dashboard:
- Real-time shift monitoring
- Overtime alerts
- Incident logging
- Export to payroll systems
- Multi-venue management

This is Phase 2 — not needed for Kingsman MVP.

---

## File Structure

```
kingsman-clockin/
├── index.html          # Main app
├── style.css           # Styles (professional, utilitarian)
├── config.js           # Settings, auto-approval, venues
├── app.js              # Core logic (GPS, clock in/out, data)
├── sw.js               # Service worker (offline support)
├── manifest.json       # PWA manifest
├── klogo.jpg           # Kingsman logo
├── README.md           # This file
└── INTEGRATION.md      # This guide
```

---

## Testing Checklist

- [ ] Badge ID input accepts text
- [ ] GPS lock acquired and displayed
- [ ] Clock In captures timestamp + GPS
- [ ] Clock Out captures timestamp + GPS
- [ ] Auto-approval works for normal shifts
- [ ] Flagged shifts appear differently in history
- [ ] Data persists across page refreshes
- [ ] Works offline (cached locally)
- [ ] Mobile-friendly (touch targets, responsive)
- [ ] No AI/machine learning mentions in UI

---

## For Vitus's Video Demo

To record a demo for Video #2:

1. Open the app on a phone
2. Show the GPS locking on
3. Enter "KG-001" as badge
4. Tap "CLOCK IN" — show the confirmation
5. Wait 10 seconds
6. Tap "CLOCK OUT" — show the shift summary
7. Show the "Recent Shifts" list

**Contrast points to highlight:**
- Old: Paper binder → photo → WhatsApp → manual spreadsheet check (10hrs/month)
- New: One tap → GPS locked → auto-approved → instant record (0hrs/month)

---

## Security Notes

- Badge IDs are stored locally (not sent to external servers)
- GPS coordinates are accuracy-limited
- No personal data collected beyond shift records
- All data can be exported/deleted by the user
- Service account keys must never be in client-side code
