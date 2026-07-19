/* ============================================
   KINGSMAN CLOCK IN/OUT — Core Application
   Venue Staffing · Multi-Guard · Pay · Admin
   ============================================ */

(function () {
  'use strict';

  // ─── State ──────────────────────────────
  const state = {
    badgeId: '',
    selectedVenueId: '',
    isClockedIn: false,
    currentShift: null,
    durationTimer: null,
    durationStartTime: null,
    shiftHistory: [],
    schedule: [],
    payRate: CONFIG.PAY.ratePerHour,
    isAdmin: false,
  };

  // ─── DOM Cache ──────────────────────────
  const els = {};
  function cacheElements() {
    els.badgeInput     = document.getElementById('badge-id');
    els.venueSelect    = document.getElementById('venue-select');
    els.clockBtn       = document.getElementById('clock-btn');
    els.clockBtnIcon   = document.getElementById('clock-btn-icon');
    els.clockBtnText   = document.getElementById('clock-btn-text');
    els.clockBtnSub    = document.getElementById('clock-btn-sub');
    els.statusBanner   = document.getElementById('status-banner');
    els.statusIcon     = document.getElementById('status-icon');
    els.statusText     = document.getElementById('status-text');
    els.shiftInfo      = document.getElementById('shift-info');
    els.shiftStatus    = document.getElementById('shift-status');
    els.shiftVenue     = document.getElementById('shift-venue');
    els.shiftTimeIn    = document.getElementById('shift-time-in');
    els.shiftDuration  = document.getElementById('shift-duration');
    els.shiftPay       = document.getElementById('shift-pay');
    els.shiftId        = document.getElementById('shift-id');
    els.coverageGrid   = document.getElementById('coverage-grid');
    els.activityList   = document.getElementById('activity-list');
    // Privacy
    els.privacyModal   = document.getElementById('privacy-modal');
    els.privacyAccept  = document.getElementById('privacy-accept');
    els.privacyBtn     = document.getElementById('privacy-btn');
    // Settings
    els.settingsBtn    = document.getElementById('settings-btn');
    els.settingsPanel  = document.getElementById('settings-panel');
    els.settingsClose  = document.getElementById('settings-close');
    els.exportBtn      = document.getElementById('export-btn');
    els.deleteBtn      = document.getElementById('delete-btn');
    els.scheduleList   = document.getElementById('schedule-list');
    els.earningsSummary = document.getElementById('earnings-summary');
    // Delete confirmation
    els.deleteModal    = document.getElementById('delete-modal');
    els.deleteCancel   = document.getElementById('delete-cancel');
    els.deleteConfirm  = document.getElementById('delete-confirm');
    els.privacyReviewBtn = document.getElementById('privacy-review-btn');
    // Admin
    els.adminGatePanel = document.getElementById('admin-gate-panel');
    els.adminPinInput  = document.getElementById('admin-pin');
    els.adminPinBtn    = document.getElementById('admin-pin-btn');
    els.adminPinCancel = document.getElementById('admin-pin-cancel');
    els.adminPinError  = document.getElementById('admin-pin-error');
    els.adminPanel     = document.getElementById('admin-panel');
    els.adminClose     = document.getElementById('admin-close');
    els.adminActiveList = document.getElementById('admin-active-list');
    els.adminEarnings  = document.getElementById('admin-earnings');
    els.schedulerForm  = document.getElementById('scheduler-form');
    els.schedBadge     = document.getElementById('sched-badge');
    els.schedVenue     = document.getElementById('sched-venue');
    els.schedDay       = document.getElementById('sched-day');
    els.schedStart     = document.getElementById('sched-start');
    els.schedEnd       = document.getElementById('sched-end');
    els.schedAddBtn    = document.getElementById('sched-add-btn');
    els.schedList      = document.getElementById('sched-list');
    els.rateInput      = document.getElementById('rate-input');
    els.rateSaveBtn    = document.getElementById('rate-save-btn');
    els.adminLogoutBtn = document.getElementById('admin-logout-btn');
  }

  // ─── Init ───────────────────────────────
  function init() {
    cacheElements();
    loadSavedState();
    checkPrivacyAcceptance();
    populateVenueSelect();
    populateScheduleForm();
    bindEvents();
    renderCoverageDashboard();
    renderActivityHistory();
    renderSchedule();
    renderEarningsSummary();
    updateClockButton();
    refreshCoverageDashboard();
  }

  // ─── Persistence ────────────────────────
  function loadSavedState() {
    const savedBadge = localStorage.getItem(CONFIG.STORAGE.USER_BADGE_KEY);
    if (savedBadge) {
      els.badgeInput.value = savedBadge;
      state.badgeId = savedBadge;
    }

    // Pay rate (overridable by admin)
    const savedRate = localStorage.getItem(CONFIG.STORAGE.PAY_RATE_KEY);
    if (savedRate) {
      state.payRate = parseFloat(savedRate);
    }

    // Shift history + retention
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE.SHIFT_HISTORY_KEY);
      if (raw) {
        state.shiftHistory = JSON.parse(raw);
        const cutoff = Date.now() - CONFIG.STORAGE.retentionMs;
        const before = state.shiftHistory.length;
        state.shiftHistory = state.shiftHistory.filter(s => new Date(s.clockIn.time).getTime() > cutoff);
        if (state.shiftHistory.length < before) {
          saveShiftHistory();
        }
      }
    } catch (e) {
      state.shiftHistory = [];
    }

    // Schedule
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE.SCHEDULE_KEY);
      if (raw) state.schedule = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    if (!state.schedule || !state.schedule.length) {
      state.schedule = JSON.parse(JSON.stringify(CONFIG.SCHEDULE));
    }

    // Active shift
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE.CURRENT_SHIFT_KEY);
      if (raw) {
        const shift = JSON.parse(raw);
        const age = Date.now() - new Date(shift.clockIn.time).getTime();
        if (age > CONFIG.RULES.maxShiftHours * 3600000) {
          autoClockOut(shift, 'expired');
        } else {
          state.currentShift = shift;
          state.isClockedIn = true;
          state.durationStartTime = new Date(shift.clockIn.time);
        }
      }
    } catch (e) { /* ignore */ }
  }

  function saveShiftHistory() {
    localStorage.setItem(CONFIG.STORAGE.SHIFT_HISTORY_KEY, JSON.stringify(state.shiftHistory));
  }

  function saveCurrentShift() {
    if (state.currentShift) {
      localStorage.setItem(CONFIG.STORAGE.CURRENT_SHIFT_KEY, JSON.stringify(state.currentShift));
    }
  }

  function saveSchedule() {
    localStorage.setItem(CONFIG.STORAGE.SCHEDULE_KEY, JSON.stringify(state.schedule));
  }

  // ─── Privacy (UK GDPR) ─────────────────
  function checkPrivacyAcceptance() {
    const accepted = localStorage.getItem(CONFIG.STORAGE.PRIVACY_KEY) === 'accepted';
    els.privacyModal.classList.toggle('hidden', accepted);
  }

  // ─── Venue Select ──────────────────────
  function populateVenueSelect() {
    els.venueSelect.innerHTML = '<option value="">— Select Venue —</option>' +
      CONFIG.VENUES.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  }

  // ─── Pay Helpers ────────────────────────
  function calculateEarnings(durationMs) {
    const hours = durationMs / 3600000;
    return hours * state.payRate;
  }

  function formatPay(amount) {
    return CONFIG.PAY.symbol + amount.toFixed(2);
  }

  function getShiftEarnings(shift) {
    if (!shift.clockOut) return 0;
    const duration = new Date(shift.clockOut.time) - new Date(shift.clockIn.time);
    const rate = shift.payRate || state.payRate;
    return (duration / 3600000) * rate;
  }

  function getTotalEarnings() {
    return state.shiftHistory
      .filter(s => s.clockOut && s.status !== 'expired')
      .reduce((sum, s) => sum + getShiftEarnings(s), 0);
  }

  function getTotalHours() {
    return state.shiftHistory
      .filter(s => s.clockOut && s.status !== 'expired')
      .reduce((sum, s) => {
        return sum + (new Date(s.clockOut.time) - new Date(s.clockIn.time)) / 3600000;
      }, 0);
  }

  // ─── Coverage Dashboard ────────────────
  function renderCoverageDashboard() {
    const activeShifts = getActiveShifts();

    els.coverageGrid.innerHTML = CONFIG.VENUES.map(venue => {
      const here = activeShifts.filter(s => s.venueId === venue.id);
      const count = here.length;
      const required = venue.minStaff;
      const isEmpty = count === 0;
      const isUnderstaffed = count > 0 && count < required;

      let statusClass = 'coverage-ok';
      if (isEmpty) statusClass = 'coverage-empty';
      else if (isUnderstaffed) statusClass = 'coverage-warn';

      // Venue cost estimate (guards × rate × hours so far)
      const venueCost = here.reduce((sum, s) => {
        const elapsed = Date.now() - new Date(s.clockIn.time).getTime();
        return sum + (elapsed / 3600000) * state.payRate;
      }, 0);

      const scheduledNow = getScheduledGuardsAtVenueNow(venue.id);
      const clockedBadges = here.map(s => s.badgeId);
      const noShows = scheduledNow.filter(s => !clockedBadges.includes(s.badgeId));

      return `
        <div class="coverage-card ${statusClass}">
          <div class="coverage-header">
            <div class="coverage-venue-name">${venue.name}</div>
            <div class="coverage-count ${statusClass}">
              <span class="coverage-num">${count}</span>
              <span class="coverage-denom">/ ${required}</span>
            </div>
          </div>
          <div class="coverage-guards">
            ${here.length > 0
              ? here.map(s => `<span class="guard-badge">${s.badgeId}</span>`).join('')
              : '<span class="coverage-none">No guards on site</span>'}
          </div>
          ${count > 0 ? `<div class="coverage-cost">Est. cost: ${formatPay(venueCost)}</div>` : ''}
          ${noShows.length > 0 ? `<div class="coverage-alert">⚠️ No-show: ${noShows.map(s => s.badgeId).join(', ')}</div>` : ''}
          ${isUnderstaffed ? `<div class="coverage-alert">⚠️ Understaffed — need ${required - count} more</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function refreshCoverageDashboard() {
    setInterval(() => {
      renderCoverageDashboard();
      renderSchedule();
      // Update live pay on shift card
      if (state.isClockedIn && els.shiftPay) {
        const elapsed = Date.now() - state.durationStartTime.getTime();
        els.shiftPay.textContent = formatPay(calculateEarnings(elapsed));
      }
    }, 10000);
  }

  // ─── Schedule View ─────────────────────
  function renderSchedule() {
    const byVenue = {};
    state.schedule.forEach(s => {
      if (!byVenue[s.venueId]) byVenue[s.venueId] = [];
      byVenue[s.venueId].push(s);
    });

    els.scheduleList.innerHTML = Object.entries(byVenue).map(([venueId, shifts]) => {
      const venue = CONFIG.VENUES.find(v => v.id === venueId);
      if (!venue) return '';
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return `
        <div class="schedule-venue">
          <div class="schedule-venue-name">${venue.name}</div>
          ${shifts.map(s => {
            const isActive = isScheduledNow(s);
            const isClocked = isGuardClockedInNow(s.badgeId);
            return `
              <div class="schedule-row ${isActive ? 'schedule-active' : ''}">
                <span class="schedule-badge">${s.badgeId}</span>
                <span class="schedule-day">${dayNames[s.day] || '—'}</span>
                <span class="schedule-time">${formatHour(s.startHour)} → ${formatHour(s.endHour)}</span>
                <span class="schedule-status ${isClocked ? 'sched-in' : (isActive ? 'sched-due' : 'sched-later')}">
                  ${isClocked ? '● On Shift' : (isActive ? '● Due Now' : '○ Off')}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('');
  }

  // ─── Earnings Summary ──────────────────
  function renderEarningsSummary() {
    const total = getTotalEarnings();
    const hours = getTotalHours();
    const shifts = state.shiftHistory.filter(s => s.clockOut && s.status !== 'expired').length;
    const thisWeek = getThisWeekEarnings();

    els.earningsSummary.innerHTML = `
      <div class="earnings-row">
        <span class="earnings-label">Rate</span>
        <span class="earnings-value">${formatPay(state.payRate)}/hr</span>
      </div>
      <div class="earnings-row">
        <span class="earnings-label">Total Hours</span>
        <span class="earnings-value">${hours.toFixed(1)}h</span>
      </div>
      <div class="earnings-row">
        <span class="earnings-label">Completed Shifts</span>
        <span class="earnings-value">${shifts}</span>
      </div>
      <div class="earnings-row earnings-total">
        <span class="earnings-label">Total Earned</span>
        <span class="earnings-value">${formatPay(total)}</span>
      </div>
      <div class="earnings-row">
        <span class="earnings-label">This Week</span>
        <span class="earnings-value">${formatPay(thisWeek)}</span>
      </div>
    `;
  }

  function getThisWeekEarnings() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return state.shiftHistory
      .filter(s => s.clockOut && s.status !== 'expired' && new Date(s.clockIn.time) >= startOfWeek)
      .reduce((sum, s) => sum + getShiftEarnings(s), 0);
  }

  // ─── Clock In / Out ────────────────────
  function handleClockAction() {
    if (state.isClockedIn) {
      clockOut();
    } else {
      clockIn();
    }
  }

  function clockIn() {
    const badge = els.badgeInput.value.trim();
    if (!badge) {
      showStatus('error', '⚠️', 'Enter your Badge Number');
      els.badgeInput.focus();
      return;
    }

    const venueId = els.venueSelect.value;
    if (!venueId) {
      showStatus('error', '⚠️', 'Select your Venue');
      els.venueSelect.focus();
      return;
    }

    const venue = CONFIG.VENUES.find(v => v.id === venueId);
    if (CONFIG.UI.vibrateOnAction && navigator.vibrate) {
      navigator.vibrate(CONFIG.UI.vibrateDuration);
    }

    const shift = {
      id: generateShiftId(),
      badgeId: badge,
      venueId: venueId,
      venueName: venue.name,
      clockIn: { time: new Date().toISOString() },
      clockOut: null,
      status: 'active',
      payRate: state.payRate, // lock rate at clock-in time
    };

    state.currentShift = shift;
    state.isClockedIn = true;
    state.durationStartTime = new Date(shift.clockIn.time);
    state.badgeId = badge;

    saveCurrentShift();
    localStorage.setItem(CONFIG.STORAGE.USER_BADGE_KEY, badge);

    updateClockButton();
    showShiftInfo(shift);
    renderCoverageDashboard();
    renderSchedule();

    const activeHere = getActiveShifts().filter(s => s.venueId === venueId);
    showStatus('success', '✅', `Clocked IN — ${venue.name} (${activeHere.length}/${venue.minStaff})`);
    startDurationTimer();
    sendToBackend(shift, 'clock-in');
  }

  function clockOut() {
    if (!state.currentShift) return;

    if (CONFIG.UI.vibrateOnAction && navigator.vibrate) {
      navigator.vibrate(CONFIG.UI.vibrateDuration);
    }

    const shift = state.currentShift;
    shift.clockOut = { time: new Date().toISOString() };
    shift.status = 'completed';

    const restWarning = checkRestPeriod(shift);

    state.isClockedIn = false;
    state.currentShift = null;
    stopDurationTimer();
    localStorage.removeItem(CONFIG.STORAGE.CURRENT_SHIFT_KEY);

    state.shiftHistory.unshift(shift);
    if (state.shiftHistory.length > CONFIG.STORAGE.maxLocalShifts) {
      state.shiftHistory = state.shiftHistory.slice(0, CONFIG.STORAGE.maxLocalShifts);
    }
    saveShiftHistory();

    updateClockButton();
    hideShiftInfo();
    renderCoverageDashboard();
    renderActivityHistory();
    renderSchedule();
    renderEarningsSummary();

    const duration = formatDuration(new Date(shift.clockIn.time), new Date(shift.clockOut.time));
    const earnings = getShiftEarnings(shift);
    const venue = CONFIG.VENUES.find(v => v.id === shift.venueId);
    const activeHere = getActiveShifts().filter(s => s.venueId === shift.venueId);

    let msg = `Clocked OUT — ${duration} — ${formatPay(earnings)}`;
    if (venue) msg += ` (${activeHere.length}/${venue.minStaff} at ${venue.name})`;
    if (restWarning) msg += ` ⚠️ ${restWarning}`;

    showStatus('info', '📤', msg);
    sendToBackend(shift, 'clock-out');
  }

  function autoClockOut(shift, reason) {
    shift.clockOut = { time: new Date().toISOString() };
    shift.status = 'expired';
    state.shiftHistory.unshift(shift);
    localStorage.removeItem(CONFIG.STORAGE.CURRENT_SHIFT_KEY);
    saveShiftHistory();
  }

  // ─── Coverage Helpers ──────────────────
  function getActiveShifts() {
    return state.shiftHistory.filter(s => s.status === 'active');
  }

  function isScheduledNow(entry) {
    const now = new Date();
    const today = now.getDay();
    if (entry.day !== undefined && entry.day !== today) return false;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = entry.startHour * 60;
    const endMinutes = entry.endHour * 60;

    if (startMinutes < endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    } else {
      return nowMinutes >= startMinutes || nowMinutes < endMinutes;
    }
  }

  function getScheduledGuardsAtVenueNow(venueId) {
    return state.schedule.filter(s => s.venueId === venueId && isScheduledNow(s));
  }

  function isGuardClockedInNow(badgeId) {
    return state.shiftHistory.some(s => s.badgeId === badgeId && s.status === 'active');
  }

  function checkRestPeriod(shift) {
    const minRestMs = CONFIG.RULES.minRestHours * 3600000;
    const prevShift = state.shiftHistory.find(
      s => s.badgeId === shift.badgeId && s.id !== shift.id && s.clockOut
    );
    if (!prevShift) return null;

    const gap = new Date(shift.clockIn.time).getTime() - new Date(prevShift.clockOut.time).getTime();
    if (gap < minRestMs) {
      return `Only ${(gap / 3600000).toFixed(1)}h rest (min ${CONFIG.RULES.minRestHours}h)`;
    }
    return null;
  }

  // ─── Clock Button State ────────────────
  function updateClockButton() {
    if (state.isClockedIn) {
      els.clockBtn.classList.add('clocked-in');
      els.clockBtnIcon.textContent = '⏹';
      els.clockBtnText.textContent = 'CLOCK OUT';
      els.clockBtnSub.textContent = state.currentShift ? state.currentShift.venueName : 'End your shift';
      els.clockBtn.disabled = false;
    } else {
      els.clockBtn.classList.remove('clocked-in');
      els.clockBtnIcon.textContent = '▶';
      els.clockBtnText.textContent = 'CLOCK IN';
      els.clockBtnSub.textContent = 'Select venue & tap to start';
      els.clockBtn.disabled = !(state.badgeId && els.venueSelect.value);
    }
  }

  // ─── Shift Info Panel ──────────────────
  function showShiftInfo(shift) {
    els.shiftInfo.classList.remove('hidden');
    els.shiftStatus.textContent = 'CLOCKED IN';
    els.shiftVenue.textContent = shift.venueName;
    els.shiftTimeIn.textContent = new Date(shift.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    els.shiftPay.textContent = formatPay(0);
    els.shiftId.textContent = shift.id;
  }

  function hideShiftInfo() {
    els.shiftInfo.classList.add('hidden');
  }

  // ─── Duration Timer ────────────────────
  function startDurationTimer() {
    if (state.durationTimer) clearInterval(state.durationTimer);
    state.durationTimer = setInterval(updateDurationDisplay, CONFIG.UI.timerInterval);
  }

  function stopDurationTimer() {
    if (state.durationTimer) {
      clearInterval(state.durationTimer);
      state.durationTimer = null;
    }
  }

  function updateDurationDisplay() {
    if (!state.isClockedIn || !state.durationStartTime) return;
    const elapsed = Date.now() - state.durationStartTime.getTime();
    els.shiftDuration.textContent = formatDurationMs(elapsed);
    els.shiftPay.textContent = formatPay(calculateEarnings(elapsed));
  }

  // ─── Activity History ──────────────────
  function renderActivityHistory() {
    if (state.shiftHistory.length === 0) {
      els.activityList.innerHTML = '<p class="empty-state">No shifts recorded yet</p>';
      return;
    }

    els.activityList.innerHTML = state.shiftHistory.slice(0, 20).map(shift => {
      const date = new Date(shift.clockIn.time).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timeIn = new Date(shift.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeOut = shift.clockOut
        ? new Date(shift.clockOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—';
      const earnings = shift.clockOut ? getShiftEarnings(shift) : 0;
      const statusClass = shift.status === 'active' ? 'badge-active' :
                          shift.status === 'expired' ? 'badge-expired' : 'badge-completed';

      return `
        <div class="activity-item">
          <div class="shift-meta">
            <div class="shift-date">${date}</div>
            <div class="shift-venue-name">${shift.venueName || shift.venueId}</div>
          </div>
          <div class="shift-details">
            <div class="shift-times">${timeIn} → ${timeOut}</div>
            <div class="shift-earnings">${formatPay(earnings)}</div>
            <span class="shift-badge ${statusClass}">${shift.badgeId}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Status Banner ─────────────────────
  function showStatus(type, icon, msg) {
    els.statusBanner.className = `status-banner status-${type}`;
    els.statusIcon.textContent = icon;
    els.statusText.textContent = msg;
    els.statusBanner.classList.remove('hidden');
    clearTimeout(state._statusTimer);
    state._statusTimer = setTimeout(() => els.statusBanner.classList.add('hidden'), 6000);
  }

  // ─── Settings Panel ────────────────────
  function openSettings() {
    els.settingsPanel.classList.remove('hidden');
    renderSchedule();
    renderEarningsSummary();
  }

  function closeSettings() {
    els.settingsPanel.classList.add('hidden');
  }

  // ─── Admin Panel ───────────────────────
  function openAdminGate() {
    els.adminGatePanel.classList.remove('hidden');
    els.adminPinInput.value = '';
    els.adminPinError.textContent = '';
    els.adminPinInput.focus();
  }

  function closeAdminGate() {
    els.adminGatePanel.classList.add('hidden');
  }

  function attemptAdminAuth() {
    const pin = els.adminPinInput.value.trim();
    if (pin === CONFIG.ADMIN.pin) {
      state.isAdmin = true;
      closeAdminGate();
      openAdminPanel();
    } else {
      els.adminPinError.textContent = 'Incorrect PIN';
      els.adminPinInput.value = '';
      els.adminPinInput.focus();
    }
  }

  function openAdminPanel() {
    els.adminPanel.classList.remove('hidden');
    els.rateInput.value = state.payRate;
    renderAdminActiveShifts();
    renderAdminEarnings();
    renderSchedulerList();
  }

  function closeAdminPanel() {
    els.adminPanel.classList.add('hidden');
    state.isAdmin = false;
  }

  // ─── Admin: Active Shifts ──────────────
  function renderAdminActiveShifts() {
    const active = getActiveShifts();
    if (active.length === 0) {
      els.adminActiveList.innerHTML = '<p class="empty-state">No active shifts right now</p>';
      return;
    }

    els.adminActiveList.innerHTML = active.map(shift => {
      const elapsed = Date.now() - new Date(shift.clockIn.time).getTime();
      const duration = formatDurationMs(elapsed);
      const earnings = calculateEarnings(elapsed);
      const rate = shift.payRate || state.payRate;

      return `
        <div class="admin-shift-card">
          <div class="admin-shift-top">
            <span class="admin-shift-badge">${shift.badgeId}</span>
            <span class="admin-shift-venue">${shift.venueName}</span>
          </div>
          <div class="admin-shift-details">
            <span>In: ${new Date(shift.clockIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>${duration}</span>
            <span>${formatPay(rate)}/hr</span>
            <span class="admin-shift-earnings">${formatPay(earnings)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Admin: Earnings ──────────────────
  function renderAdminEarnings() {
    // Group by guard
    const guardStats = {};
    state.shiftHistory.filter(s => s.clockOut && s.status !== 'expired').forEach(s => {
      if (!guardStats[s.badgeId]) guardStats[s.badgeId] = { hours: 0, earnings: 0, shifts: 0 };
      const duration = (new Date(s.clockOut.time) - new Date(s.clockIn.time)) / 3600000;
      const rate = s.payRate || state.payRate;
      guardStats[s.badgeId].hours += duration;
      guardStats[s.badgeId].earnings += duration * rate;
      guardStats[s.badgeId].shifts += 1;
    });

    // Group by venue
    const venueStats = {};
    state.shiftHistory.filter(s => s.clockOut && s.status !== 'expired').forEach(s => {
      const key = s.venueName || s.venueId;
      if (!venueStats[key]) venueStats[key] = { hours: 0, earnings: 0, shifts: 0 };
      const duration = (new Date(s.clockOut.time) - new Date(s.clockIn.time)) / 3600000;
      const rate = s.payRate || state.payRate;
      venueStats[key].hours += duration;
      venueStats[key].earnings += duration * rate;
      venueStats[key].shifts += 1;
    });

    const totalEarnings = Object.values(guardStats).reduce((s, g) => s + g.earnings, 0);
    const totalHours = Object.values(guardStats).reduce((s, g) => s + g.hours, 0);

    els.adminEarnings.innerHTML = `
      <div class="admin-stats-row">
        <div class="admin-stat">
          <div class="admin-stat-value">${totalHours.toFixed(1)}h</div>
          <div class="admin-stat-label">Total Hours</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-value">${formatPay(totalEarnings)}</div>
          <div class="admin-stat-label">Total Pay</div>
        </div>
        <div class="admin-stat">
          <div class="admin-stat-value">${state.shiftHistory.filter(s => s.status === 'active').length}</div>
          <div class="admin-stat-label">On Shift Now</div>
        </div>
      </div>
      <h4 class="admin-subheading">Per Guard</h4>
      ${Object.entries(guardStats).map(([badge, stats]) => `
        <div class="admin-earnings-row">
          <span class="admin-earnings-badge">${badge}</span>
          <span>${stats.shifts} shifts</span>
          <span>${stats.hours.toFixed(1)}h</span>
          <span class="admin-earnings-amount">${formatPay(stats.earnings)}</span>
        </div>
      `).join('')}
      <h4 class="admin-subheading">Per Venue</h4>
      ${Object.entries(venueStats).map(([name, stats]) => `
        <div class="admin-earnings-row">
          <span class="admin-earnings-venue">${name}</span>
          <span>${stats.shifts} shifts</span>
          <span>${stats.hours.toFixed(1)}h</span>
          <span class="admin-earnings-amount">${formatPay(stats.earnings)}</span>
        </div>
      `).join('')}
    `;
  }

  // ─── Admin: Scheduler CRUD ─────────────
  function populateScheduleForm() {
    els.schedVenue.innerHTML = '<option value="">— Venue —</option>' +
      CONFIG.VENUES.map(v => `<option value="${v.id}">${v.name}</option>`).join('');

    els.schedDay.innerHTML = [
      { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' },
      { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 0, l: 'Sun' },
    ].map(d => `<option value="${d.v}">${d.l}</option>`).join('');

    // Hour options 0-23
    const hourOpts = Array.from({ length: 24 }, (_, i) => {
      const label = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`;
      return `<option value="${i}">${label}</option>`;
    }).join('');
    els.schedStart.innerHTML = '<option value="">Start</option>' + hourOpts;
    els.schedEnd.innerHTML = '<option value="">End</option>' + hourOpts;
  }

  function addScheduledShift() {
    const badge = els.schedBadge.value.trim();
    const venueId = els.schedVenue.value;
    const day = parseInt(els.schedDay.value);
    const startHour = parseInt(els.schedStart.value);
    const endHour = parseInt(els.schedEnd.value);

    if (!badge || !venueId || isNaN(startHour) || isNaN(endHour)) {
      showStatus('error', '⚠️', 'Fill all fields');
      return;
    }

    state.schedule.push({ badgeId: badge.toUpperCase(), venueId, day, startHour, endHour });
    saveSchedule();
    renderSchedule();
    renderSchedulerList();

    // Clear form
    els.schedBadge.value = '';
    els.schedVenue.value = '';
    els.schedStart.value = '';
    els.schedEnd.value = '';

    showStatus('success', '✅', `Scheduled ${badge.toUpperCase()} — ${CONFIG.VENUES.find(v => v.id === venueId)?.name}`);
  }

  function deleteScheduledShift(index) {
    state.schedule.splice(index, 1);
    saveSchedule();
    renderSchedule();
    renderSchedulerList();
  }

  function renderSchedulerList() {
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    els.schedList.innerHTML = state.schedule.map((s, i) => {
      const venue = CONFIG.VENUES.find(v => v.id === s.venueId);
      return `
        <div class="sched-admin-row">
          <span class="sched-admin-badge">${s.badgeId}</span>
          <span class="sched-admin-venue">${venue ? venue.name : s.venueId}</span>
          <span class="sched-admin-day">${dayNames[s.day] || '?'}</span>
          <span class="sched-admin-time">${formatHour(s.startHour)}→${formatHour(s.endHour)}</span>
          <button class="sched-delete-btn" data-idx="${i}">✕</button>
        </div>
      `;
    }).join('');

    // Bind delete buttons
    els.schedList.querySelectorAll('.sched-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteScheduledShift(parseInt(btn.dataset.idx)));
    });
  }

  function updatePayRate() {
    const rate = parseFloat(els.rateInput.value);
    if (isNaN(rate) || rate <= 0) {
      showStatus('error', '⚠️', 'Enter a valid rate');
      return;
    }
    state.payRate = rate;
    localStorage.setItem(CONFIG.STORAGE.PAY_RATE_KEY, rate.toString());
    showStatus('success', '✅', `Rate updated to ${formatPay(rate)}/hr`);
    renderEarningsSummary();
    renderCoverageDashboard();
  }

  // ─── Data Export (UK GDPR) ─────────────
  function exportShiftData() {
    if (state.shiftHistory.length === 0) {
      showStatus('info', 'ℹ️', 'No shift data to export');
      return;
    }

    const headers = ['Shift ID', 'Badge', 'Venue', 'Clock In', 'Clock Out', 'Duration (min)', 'Rate (£/hr)', 'Earnings (£)', 'Status'];
    const rows = state.shiftHistory.map(s => {
      const earnings = s.clockOut ? getShiftEarnings(s) : 0;
      return [
        s.id, s.badgeId, s.venueName || s.venueId,
        s.clockIn.time, s.clockOut ? s.clockOut.time : '',
        s.clockOut ? Math.round((new Date(s.clockOut.time) - new Date(s.clockIn.time)) / 60000) : '',
        s.payRate || state.payRate,
        earnings.toFixed(2),
        s.status,
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kingsman-shifts-${state.badgeId || 'all'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', '📥', `Exported ${state.shiftHistory.length} shifts`);
  }

  // ─── Data Deletion (UK GDPR) ──────────
  function requestDataDeletion() {
    els.deleteModal.classList.remove('hidden');
  }

  function confirmDataDeletion() {
    localStorage.removeItem(CONFIG.STORAGE.CURRENT_SHIFT_KEY);
    localStorage.removeItem(CONFIG.STORAGE.SHIFT_HISTORY_KEY);
    localStorage.removeItem(CONFIG.STORAGE.USER_BADGE_KEY);
    localStorage.removeItem(CONFIG.STORAGE.PRIVACY_KEY);
    localStorage.removeItem(CONFIG.STORAGE.SCHEDULE_KEY);
    localStorage.removeItem(CONFIG.STORAGE.PAY_RATE_KEY);
    localStorage.removeItem(CONFIG.STORAGE.ADMIN_KEY);

    state.shiftHistory = [];
    state.currentShift = null;
    state.isClockedIn = false;
    state.badgeId = '';
    state.payRate = CONFIG.PAY.ratePerHour;

    els.badgeInput.value = '';
    els.venueSelect.value = '';
    els.deleteModal.classList.add('hidden');
    closeSettings();
    renderActivityHistory();
    renderCoverageDashboard();
    renderSchedule();
    renderEarningsSummary();
    updateClockButton();
    hideShiftInfo();
    showStatus('info', '🗑️', 'All data deleted');
  }

  // ─── Backend ───────────────────────────
  async function sendToBackend(shift, action) {
    if (!CONFIG.WEBHOOK.enabled || !CONFIG.WEBHOOK.url) return;
    try {
      await fetch(CONFIG.WEBHOOK.url, {
        method: CONFIG.WEBHOOK.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, shift, timestamp: new Date().toISOString() }),
      });
    } catch (e) {
      console.warn('Backend send failed:', e);
    }
  }

  // ─── Utilities ─────────────────────────
  function generateShiftId() {
    const now = new Date();
    const ts = now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    return `KM-${ts}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  function formatDuration(start, end) {
    return formatDurationMs(Math.abs(end - start));
  }

  function formatDurationMs(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatHour(h) {
    if (h === 0) return '12am';
    if (h < 12) return h + 'am';
    if (h === 12) return '12pm';
    return (h - 12) + 'pm';
  }

  // ─── Event Binding ─────────────────────
  function bindEvents() {
    // Badge
    els.badgeInput.addEventListener('input', () => {
      state.badgeId = els.badgeInput.value.trim();
      localStorage.setItem(CONFIG.STORAGE.USER_BADGE_KEY, state.badgeId);
      updateClockButton();
    });

    // Venue
    els.venueSelect.addEventListener('change', () => {
      state.selectedVenueId = els.venueSelect.value;
      updateClockButton();
    });

    // Clock
    els.clockBtn.addEventListener('click', handleClockAction);

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleClockAction();
      }
    });

    // Visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.isClockedIn) saveCurrentShift();
    });
    window.addEventListener('beforeunload', () => {
      if (state.isClockedIn) saveCurrentShift();
    });

    // Privacy
    els.privacyAccept.addEventListener('change', () => {
      els.privacyBtn.disabled = !els.privacyAccept.checked;
    });
    els.privacyBtn.addEventListener('click', () => {
      if (els.privacyAccept.checked) {
        localStorage.setItem(CONFIG.STORAGE.PRIVACY_KEY, 'accepted');
        els.privacyModal.classList.add('hidden');
        showStatus('success', '✓', 'Privacy notice accepted');
      }
    });

    // Settings
    els.settingsBtn.addEventListener('click', openSettings);
    els.settingsClose.addEventListener('click', closeSettings);
    els.exportBtn.addEventListener('click', exportShiftData);
    els.deleteBtn.addEventListener('click', requestDataDeletion);
    els.deleteCancel.addEventListener('click', () => els.deleteModal.classList.add('hidden'));
    els.deleteConfirm.addEventListener('click', confirmDataDeletion);
    els.privacyReviewBtn.addEventListener('click', () => {
      closeSettings();
      els.privacyModal.classList.remove('hidden');
      els.privacyAccept.checked = false;
      els.privacyBtn.disabled = true;
    });

    // Admin gate — button in settings opens PIN modal
    document.getElementById('admin-gate').addEventListener('click', openAdminGate);

    // PIN modal — click outside to close
    els.adminGatePanel.addEventListener('click', (e) => {
      if (e.target === els.adminGatePanel) closeAdminGate();
    });
    els.adminPinCancel.addEventListener('click', closeAdminGate);
    els.adminPinBtn.addEventListener('click', attemptAdminAuth);
    els.adminPinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptAdminAuth();
    });
    els.adminClose.addEventListener('click', closeAdminPanel);
    els.adminLogoutBtn.addEventListener('click', closeAdminPanel);

    // Scheduler
    els.schedAddBtn.addEventListener('click', addScheduledShift);
    els.rateSaveBtn.addEventListener('click', updatePayRate);
  }

  // ─── Start ─────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
