# Kingsman Clock In/Out — Legal Compliance Intelligence

**Compiled:** 2026-07-19
**Status:** ACTIVE THREAT — Legislation in force or imminently enforceable

---

## CRITICAL: Legislation Now Affecting This Product

### 1. Data (Use and Access) Act 2025
- **Royal Assent:** 19 June 2025
- **Status:** NOW IN FORCE
- **Impact:** Reforms UK GDPR. All data protection provisions now active.
- **Our exposure:** GPS location tracking of workers = personal data processing. Must have documented lawful basis.

### 2. "Make Work Pay" — Workplace Monitoring Technologies Consultation
- **Published:** 8 July 2026 (11 DAYS AGO)
- **Status:** CONSULTATION OPEN — closes 30 September 2026
- **Impact:** Government considering MANDATORY CONSULTATION with trade unions/staff reps before deploying monitoring tech.
- **Our exposure:** If Kingsman has any staff reps or union presence, we MUST consult before deploying the app. Even without union, the 8 principles of responsible monitoring apply.

### 3. Employment Rights Act 2025
- **Status:** Royal Assent received, implementation phased
- **Impact:** Right to disconnect coming via Code of Practice. Surveillance technology consultation ongoing.
- **Our exposure:** App must not create expectation of out-of-hours availability. GPS must only activate during shifts.

### 4. ICO Employee Monitoring Guidance (Updated)
- **Status:** ENFORCEABLE NOW
- **Impact:** ICO explicitly names "technologies for monitoring timekeeping or access control" and "body worn devices to track the location of workers" as monitoring requiring compliance.
- **Our exposure:** The Clock In/Out app is EXACTLY the type of technology ICO is targeting.

---

## The 8 Principles of Responsible Monitoring (from consultation)

The government has set out 8 principles employers MUST comply with:

1. **Purpose** — Must have declared, specific purpose (not "just in case")
2. **Transparency** — Workers must know what's collected, why, how long kept, who has access
3. **Necessity** — Monitoring must be necessary for the declared purpose
4. **Proportionality** — Must not collect more data than needed
5. **Human Oversight** — Automated decisions must have human review capability
6. **Fairness** — Must not use monitoring to disadvantage workers
7. **Accuracy** — Data must be accurate and kept up to date
8. **Worker Engagement** — Must consult workers before introducing monitoring

---

## What MIRA Must Build Into the App (Compliance-by-Design)

### A. Data Protection (UK GDPR + DUA Act 2025)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Lawful basis documented** | Legitimate interests (Article 6(1)(f)) for job verification, NOT consent | ⚠️ MUST DOCUMENT |
| **Privacy notice** | In-app notice shown on first use, explaining GPS tracking, purpose, retention, rights | ❌ NOT BUILT |
| **Data minimisation** | GPS only during active shift (clock-in to clock-out), not 24/7 | ✅ ALREADY DOING |
| **Purpose limitation** | GPS for location verification only, not performance monitoring | ✅ ALREADY DOING |
| **Retention period** | Auto-delete shift data after 24 months (defensible per ICO guidance) | ❌ NOT BUILT |
| **Subject Access Requests** | Export function for guards to see their own data | ❌ NOT BUILT |
| **Right to erasure** | Delete account + all data function | ❌ NOT BUILT |
| **Data portability** | Export shift data as CSV/JSON | ❌ NOT BUILT |
| **Breach notification** | 72-hour notification process if data compromised | ⚠️ MUST DOCUMENT |

### B. Worker Transparency (Consultation Principles)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **What's collected** | Clear list: GPS coordinates, timestamp, badge ID, venue match | ❌ NOT SHOWN |
| **Why it's collected** | "To verify your attendance at the assigned venue" | ❌ NOT SHOWN |
| **How long kept** | "Shift records retained for 24 months, then auto-deleted" | ❌ NOT SHOWN |
| **Who has access** | "Your managers (John/Graham) and you" | ❌ NOT SHOWN |
| **Your rights** | SAR, erasure, export, complaint to ICO | ❌ NOT SHOWN |
| **Worker consultation** | Must consult before deploying at Kingsman | ⚠️ ACTION REQUIRED |

### C. Technical Compliance Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Shift-only GPS** | GPS activates on clock-in, deactivates on clock-out. No background tracking. | ✅ PARTIAL |
| **Break exclusion** | If guard takes break, GPS pauses. Working Time Regulations compliant. | ❌ NOT BUILT |
| **Max hours enforcement** | Alert if guard exceeds 48hr/week (Working Time Regulations) | ❌ NOT BUILT |
| **Rest period tracking** | Ensure 11hr daily rest between shifts | ❌ NOT BUILT |
| **Audit log** | Immutable record of who accessed data and when | ❌ NOT BUILT |
| **Data encryption** | Encryption at rest (localStorage) and in transit (HTTPS) | ⚠️ PARTIAL |
| **Auto-delete** | Shift data purged after retention period | ❌ NOT BUILT |
| **Consent withdrawal** | Guard can stop tracking (clock out) and request data deletion | ❌ NOT BUILT |

### D. Right to Disconnect

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **No out-of-hours comms** | App must not send notifications outside shift hours | ❌ NOT BUILT |
| **Clear boundaries** | Display shift start/end times, no "on-call" expectation | ⚠️ PARTIAL |
| **Manager alerts only during shift** | Red-flag alerts only sent during active shift window | ❌ NOT BUILT |

---

## Risk Assessment

### If We Deploy Without Compliance

| Risk | Likelihood | Impact | Fine Potential |
|------|------------|--------|----------------|
| ICO investigation (worker complaint) | HIGH | SEVERE | Up to £17.5M or 4% turnover |
| Employment tribunal (unfair monitoring) | MEDIUM | HIGH | Uncapped compensation |
| Non-compliance with DUA Act 2025 | HIGH | SEVERE | ICO enforcement action |
| Pre-consultation failure (union) | MEDIUM | HIGH | Injunction + reputational damage |
| Working Time Regulations breach | MEDIUM | MEDIUM | Employment tribunal |

### What Protects Us

- **"Job verification" framing** — ICO treats verification differently from surveillance
- **Shift-only GPS** — Not always-on tracking
- **Auto-approval** — Reduces human intervention = less bias risk
- **No AI/ML** — Avoids EU AI Act "high-risk" classification
- **No performance scoring** — We don't rate guards, just verify attendance

---

## Recommended Immediate Actions

### Before Deploying at Kingsman

1. **Create Privacy Notice** — In-app first-use screen explaining everything
2. **Document Lawful Basis** — Write the Legitimate Interests Assessment (LIA)
3. **Add Data Export** — Guards can download their shift history
4. **Add Account Deletion** — Guards can request full data erasure
5. **Set Retention Period** — Auto-delete after 24 months
6. **Consult Vitus** — He's the bridge to Kingsman. Must explain compliance requirements
7. **Consult Kingsman** — Even without union, best practice is to inform workers before deploying

### In the App

- First-use privacy screen with "I understand" acknowledgement
- Settings page showing: what's collected, why, retention period, rights
- Data export button (CSV download)
- Account deletion request button
- Shift-only GPS (no background tracking)
- Working Time Regulations warnings
- Rest period validation

---

## Legal References

- Data (Use and Access) Act 2025: https://www.legislation.gov.uk/ukpga/2025/18/enacted
- Employment Rights Act 2025: https://www.legislation.gov.uk/ukpga/2025/36
- ICO Monitoring Workers Guidance: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/
- Make Work Pay Consultation (July 2026): https://www.gov.uk/government/consultations/make-work-pay-workplace-monitoring-technologies
- ICO GPS Tracking Guidance: https://geotapp.com/blog/en/2026/04/13/ico-employee-gps-tracking-uk-gdpr-2026/

---

*This document is for internal planning only. Not legal advice. Consult a solicitor for formal compliance sign-off.*
