/* ============================================
   KINGSMAN CLOCK IN/OUT — Configuration
   Venue Staffing · Shifts · Pay · Admin
   ============================================ */

const CONFIG = {

  // ---- Pay Rate (set by Head Office) ----
  PAY: {
    ratePerHour: 12.50,         // £/hour — default rate
    currency: 'GBP',
    symbol: '£',
  },

  // ---- Venues ----
  VENUES: [
    { id: "hq-001", name: "Kingsman HQ",                  minStaff: 1 },
    { id: "lev-001", name: "Mojo Bar",                    minStaff: 2 },
    { id: "lev-002", name: "Revolution Call Lane",         minStaff: 2 },
    { id: "lev-003", name: "Brooklyn Bar",                 minStaff: 2 },
    { id: "lev-004", name: "Distrikt Bar",                 minStaff: 2 },
    { id: "lev-005", name: "Fibre Nightclub",              minStaff: 3 },
    { id: "lev-006", name: "The Faversham",                minStaff: 2 },
    { id: "lev-007", name: "Viaduct Showbar",              minStaff: 2 },
    { id: "lev-008", name: "Sky Lounge",                   minStaff: 2 },
    { id: "lev-009", name: "Slug & Lettuce",               minStaff: 2 },
    { id: "lev-010", name: "The Wardrobe",                 minStaff: 1 },
  ],

  // ---- Scheduled Shifts (Roster) ----
  // { badgeId, venueId, day (0=Sun..6=Sat), startHour, endHour }
  // Admin can add/edit/delete via the scheduler.
  SCHEDULE: [
    // Friday night
    { badgeId: "KG-001", venueId: "lev-001", day: 5, startHour: 16, endHour: 2 },
    { badgeId: "KG-002", venueId: "lev-001", day: 5, startHour: 0,  endHour: 8 },
    { badgeId: "KG-003", venueId: "lev-002", day: 5, startHour: 18, endHour: 4 },
    { badgeId: "KG-004", venueId: "lev-002", day: 5, startHour: 20, endHour: 6 },
    { badgeId: "KG-005", venueId: "lev-005", day: 5, startHour: 21, endHour: 5 },
    { badgeId: "KG-006", venueId: "lev-005", day: 5, startHour: 22, endHour: 6 },
    { badgeId: "KG-007", venueId: "lev-005", day: 5, startHour: 23, endHour: 7 },
    // Saturday night
    { badgeId: "KG-008", venueId: "lev-003", day: 6, startHour: 17, endHour: 3 },
    { badgeId: "KG-009", venueId: "lev-003", day: 6, startHour: 19, endHour: 5 },
    // Kingsman HQ — weekdays
    { badgeId: "KG-010", venueId: "hq-001",  day: 1, startHour: 8,  endHour: 16 },
    { badgeId: "KG-010", venueId: "hq-001",  day: 2, startHour: 8,  endHour: 16 },
    { badgeId: "KG-010", venueId: "hq-001",  day: 3, startHour: 8,  endHour: 16 },
    { badgeId: "KG-010", venueId: "hq-001",  day: 4, startHour: 8,  endHour: 16 },
  ],

  // ---- Staffing Rules ----
  RULES: {
    noShowGraceMinutes: 30,
    maxShiftHours: 12,
    minRestHours: 8,
  },

  // ---- Admin ----
  ADMIN: {
    pin: '1234',  // Manager PIN to access admin panel
  },

  // ---- Data Storage ----
  STORAGE: {
    CURRENT_SHIFT_KEY:  'kingsman_current_shift',
    SHIFT_HISTORY_KEY:  'kingsman_shift_history',
    SCHEDULE_KEY:       'kingsman_schedule',
    USER_BADGE_KEY:     'kingsman_user_badge',
    PRIVACY_KEY:        'kingsman_privacy_accepted',
    PAY_RATE_KEY:       'kingsman_pay_rate',
    ADMIN_KEY:          'kingsman_admin_auth',
    maxLocalShifts:     500,
    retentionMs:        24 * 30 * 24 * 60 * 60 * 1000,
  },

  // ---- Webhook ----
  WEBHOOK: {
    enabled: false,
    url: '',
    method: 'POST',
  },

  // ---- UI ----
  UI: {
    companyName:    'Kingsman Group',
    companyTagline: 'Security & Facilities Management',
    vibrateOnAction: true,
    vibrateDuration: 200,
    timerInterval:   1000,
  },
};

Object.freeze(CONFIG);
