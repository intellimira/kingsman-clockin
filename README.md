# Kingsman Clock In/Out

Mobile-first PWA for Kingsman Group security personnel. Shift clock in/out with live venue coverage tracking, pay calculation, and manager admin panel.

## Features

- **Clock In/Out** — Select venue, tap to start/end shift
- **Live Pay Counter** — Real-time £ earnings display (configurable rate)
- **Venue Coverage Dashboard** — Live view of all venues with staffing levels
- **Multi-Guard Support** — Multiple guards per venue, overlap/handover tracking
- **Shift Scheduler** — Admin can add/edit/delete scheduled shifts
- **No-Show Detection** — Flags scheduled guards who haven't clocked in
- **Rest Period Enforcement** — Warns if < 8hrs between shifts
- **Earnings Summary** — Total hours, total pay, weekly earnings
- **Manager Panel** — PIN-gated admin with earnings overview and scheduler
- **Data Export** — CSV download of shift history (UK GDPR compliant)
- **Privacy Notice** — First-use GDPR disclosure with consent gate
- **Offline PWA** — Works without internet, installable to home screen

## Tech Stack

- Vanilla HTML/CSS/JS — no frameworks, no build step
- MIRA Antigravity Design System tokens
- Service Worker for offline caching
- localStorage for persistence
- Google Sheets / Webhook backend (optional)

## Getting Started

1. Open `index.html` in a mobile browser
2. Accept the privacy notice
3. Enter your badge number and select a venue
4. Tap CLOCK IN to start your shift

## Manager Access

1. Go to Settings (gear icon)
2. Tap "Manager Access"
3. Enter PIN: `1234`
4. View active shifts, earnings, manage schedule, change pay rate

## Pay Rate

Default: £12.50/hour (configurable by admin). Rate is locked per shift at clock-in time.

## Data & Privacy

- UK GDPR compliant (Data Protection Act 2018)
- Data (Use and Access) Act 2025 ready
- 24-month auto-retention with automatic purge
- Full data export and deletion rights
- No GPS tracking — venue is self-selected

## File Structure

```
kingsman-clockin/
├── index.html          # Main PWA
├── style.css           # MIRA Design System + Kingsman brand
├── app.js              # Core application logic
├── config.js           # Venues, schedule, pay rate, rules
├── sw.js               # Service worker (offline)
├── manifest.json       # PWA manifest
├── klogo.jpg           # Kingsman logo
├── mira-design-tokens.css  # Design system tokens
├── INTEGRATION.md      # Backend setup guide
└── LEGAL_COMPLIANCE.md # Legal analysis
```

## License

Proprietary — Kingsman Group & MiRA
