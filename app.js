/* ==================== APP STATE ==================== */
const AppState = {
    bookings: JSON.parse(localStorage.getItem('mehndi_bookings') || '[]'),
    blockedDates: JSON.parse(localStorage.getItem('mehndi_blocked') || '[]'),
    availability: JSON.parse(localStorage.getItem('mehndi_availability') || 'null') || {
        Monday:    { enabled: true, start: '10:00', end: '20:00' },
        Tuesday:   { enabled: true, start: '10:00', end: '20:00' },
        Wednesday: { enabled: true, start: '10:00', end: '20:00' },
        Thursday:  { enabled: true, start: '10:00', end: '20:00' },
        Friday:    { enabled: true, start: '10:00', end: '20:00' },
        Saturday:  { enabled: true, start: '10:00', end: '20:00' },
        Sunday:    { enabled: false, start: '10:00', end: '18:00' },
    },
    currentStep: 1,
    selectedDate: null,
    selectedTime: null,
    calendarDate: new Date(),
    adminCalDate: new Date(),
    isAdmin: false,
    isMobile: window.innerWidth <= 768,
};

function saveState() {
    localStorage.setItem('mehndi_bookings', JSON.stringify(AppState.bookings));
    localStorage.setItem('mehndi_blocked', JSON.stringify(AppState.blockedDates));
    localStorage.setItem('mehndi_availability', JSON.stringify(AppState.availability));
}

/* ==================== MOBILE DETECTION ==================== */
window.addEventListener('resize', () => {
    AppState.isMobile = window.innerWidth <= 768;
});

/* ==================== PRELOADER ==================== */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('preloader').classList.add('hidden'), 1200);
    initCounters();
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        let now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

/* ==================== NAVBAR ==================== */
const navbar = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNavLink();
});

navToggle.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.classList.toggle('open');
});

// Close mobile menu when clicking on a link
navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (AppState.isMobile && !navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
    }
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.section === current);
    });
}

/* ==================== COUNTER ANIMATION ==================== */
function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = +el.dataset.count;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current);
        }, 30);
    });
}

/* ==================== GALLERY FILTER ==================== */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
        });
    });
});

/* ==================== TESTIMONIALS ==================== */
let currentTestimonial = 0;
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.testimonial-dots .dot');

function showTestimonial(index) {
    testimonialCards.forEach(c => c.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    testimonialCards[index].classList.add('active');
    dots[index].classList.add('active');
    currentTestimonial = index;
}

dots.forEach(d => d.addEventListener('click', () => showTestimonial(+d.dataset.index)));
setInterval(() => showTestimonial((currentTestimonial + 1) % testimonialCards.length), 5000);

/* ==================== BOOKING - SERVICE BUTTONS ==================== */
document.querySelectorAll('.service-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.dataset.serviceName;
        document.querySelectorAll('.service-option input').forEach(inp => {
            if (inp.value === name) inp.checked = true;
        });
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            setTimeout(() => {
                bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    });
});

/* ==================== BOOKING - MULTI-STEP ==================== */
const bookingForm = document.getElementById('booking-form');
const btnNext = document.getElementById('btn-next');
const btnPrev = document.getElementById('btn-prev');
const btnConfirm = document.getElementById('btn-confirm');

function goToStep(step) {
    AppState.currentStep = step;
    document.querySelectorAll('.booking-step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');

    document.querySelectorAll('.booking-steps .step').forEach(s => {
        const sn = +s.dataset.step;
        s.classList.toggle('active', sn === step);
        s.classList.toggle('completed', sn < step);
    });

    btnPrev.style.display = step > 1 ? 'inline-flex' : 'none';
    btnNext.style.display = step < 4 ? 'inline-flex' : 'none';
    btnConfirm.style.display = step === 4 ? 'inline-flex' : 'none';

    if (step === 2) renderCalendar();
    if (step === 4) renderSummary();
    
    // Smooth scroll to booking form on mobile
    if (AppState.isMobile) {
        const formEl = document.querySelector('.booking-container');
        if (formEl) {
            setTimeout(() => {
                formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
}

btnNext.addEventListener('click', () => {
    if (AppState.currentStep === 1) {
        const sel = document.querySelector('input[name="service"]:checked');
        if (!sel) return showToast('Please select a service', 'error');
    }
    if (AppState.currentStep === 2) {
        if (!AppState.selectedDate) return showToast('Please select a date', 'error');
        if (!AppState.selectedTime) return showToast('Please select a time slot', 'error');
    }
    if (AppState.currentStep === 3) {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const email = document.getElementById('client-email').value.trim();
        if (!name || !phone || !email) return showToast('Please fill all required fields', 'error');
        if (!/\S+@\S+\.\S+/.test(email)) return showToast('Please enter a valid email', 'error');
    }
    if (AppState.currentStep < 4) goToStep(AppState.currentStep + 1);
});

btnPrev.addEventListener('click', () => {
    if (AppState.currentStep > 1) goToStep(AppState.currentStep - 1);
});

/* ==================== CALENDAR ==================== */
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function renderCalendar() {
    const d = AppState.calendarDate;
    const year = d.getFullYear(), month = d.getMonth();
    document.getElementById('cal-month-year').textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    const container = document.getElementById('cal-days');
    container.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
        container.innerHTML += '<div class="cal-day empty"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDate(date);
        const dayName = dayNames[date.getDay()];
        const avail = AppState.availability[dayName];
        const isBlocked = AppState.blockedDates.some(b => b.date === dateStr);
        const isPast = date < today;
        const isDisabled = isPast || !avail?.enabled || isBlocked;
        const isToday = date.getTime() === today.getTime();
        const isSelected = AppState.selectedDate === dateStr;

        let cls = 'cal-day';
        if (isDisabled) cls += ' disabled';
        if (isToday) cls += ' today';
        if (isSelected) cls += ' selected';

        const el = document.createElement('div');
        el.className = cls;
        el.textContent = day;
        if (!isDisabled) {
            el.addEventListener('click', () => selectDate(dateStr));
        }
        container.appendChild(el);
    }
}

document.getElementById('cal-prev').addEventListener('click', () => {
    AppState.calendarDate.setMonth(AppState.calendarDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', () => {
    AppState.calendarDate.setMonth(AppState.calendarDate.getMonth() + 1);
    renderCalendar();
});

function selectDate(dateStr) {
    AppState.selectedDate = dateStr;
    AppState.selectedTime = null;
    renderCalendar();
    renderTimeSlots(dateStr);
}

function renderTimeSlots(dateStr) {
    const container = document.getElementById('time-slots');
    const hint = document.getElementById('time-hint');
    hint.style.display = 'none';
    container.innerHTML = '';

    const date = new Date(dateStr + 'T00:00:00');
    const dayName = dayNames[date.getDay()];
    const avail = AppState.availability[dayName];
    if (!avail || !avail.enabled) return;

    const startH = parseInt(avail.start.split(':')[0]);
    const endH = parseInt(avail.end.split(':')[0]);
    const bookedSlots = AppState.bookings
        .filter(b => b.date === dateStr && b.status !== 'cancelled')
        .map(b => b.time);

    for (let h = startH; h < endH; h++) {
        const time = `${h.toString().padStart(2,'0')}:00`;
        const label = formatTime(time);
        const isBooked = bookedSlots.includes(time);

        const el = document.createElement('div');
        el.className = `time-slot${isBooked ? ' booked' : ''}${AppState.selectedTime === time ? ' selected' : ''}`;
        el.textContent = label;
        if (!isBooked) {
            el.addEventListener('click', () => {
                AppState.selectedTime = time;
                renderTimeSlots(dateStr);
            });
        }
        container.appendChild(el);
    }
}

/* ==================== BOOKING SUMMARY ==================== */
function renderSummary() {
    const service = document.querySelector('input[name="service"]:checked');
    const container = document.getElementById('booking-summary');
    container.innerHTML = `
        <div class="summary-row"><span class="summary-label">Service</span><span class="summary-value">${service?.value || '-'}</span></div>
        <div class="summary-row"><span class="summary-label">Price</span><span class="summary-value highlight">₹${Number(service?.dataset.price || 0).toLocaleString()}</span></div>
        <div class="summary-row"><span class="summary-label">Duration</span><span class="summary-value">${service?.dataset.duration || '-'}</span></div>
        <div class="summary-row"><span class="summary-label">Date</span><span class="summary-value">${AppState.selectedDate ? formatDateDisplay(AppState.selectedDate) : '-'}</span></div>
        <div class="summary-row"><span class="summary-label">Time</span><span class="summary-value">${AppState.selectedTime ? formatTime(AppState.selectedTime) : '-'}</span></div>
        <div class="summary-row"><span class="summary-label">Name</span><span class="summary-value">${document.getElementById('client-name').value}</span></div>
        <div class="summary-row"><span class="summary-label">Phone</span><span class="summary-value">${document.getElementById('client-phone').value}</span></div>
        <div class="summary-row"><span class="summary-label">Email</span><span class="summary-value">${document.getElementById('client-email').value}</span></div>
        <div class="summary-row"><span class="summary-label">Occasion</span><span class="summary-value">${document.getElementById('client-event').value || 'Not specified'}</span></div>
    `;
}

/* ==================== SUBMIT BOOKING ==================== */
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const service = document.querySelector('input[name="service"]:checked');
    const booking = {
        id: 'BK' + Date.now().toString(36).toUpperCase(),
        service: service.value,
        price: +service.dataset.price,
        duration: service.dataset.duration,
        date: AppState.selectedDate,
        time: AppState.selectedTime,
        name: document.getElementById('client-name').value.trim(),
        phone: document.getElementById('client-phone').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        event: document.getElementById('client-event').value,
        notes: document.getElementById('client-notes').value.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    AppState.bookings.push(booking);
    saveState();

    // Show success
    const successDetails = document.getElementById('success-details');
    successDetails.innerHTML = `
        <div class="summary-row"><span class="summary-label">Booking ID</span><span class="summary-value highlight">${booking.id}</span></div>
        <div class="summary-row"><span class="summary-label">Service</span><span class="summary-value">${booking.service}</span></div>
        <div class="summary-row"><span class="summary-label">Date & Time</span><span class="summary-value">${formatDateDisplay(booking.date)} at ${formatTime(booking.time)}</span></div>
    `;
    document.getElementById('booking-success-modal').classList.add('active');

    // Reset form
    bookingForm.reset();
    AppState.currentStep = 1;
    AppState.selectedDate = null;
    AppState.selectedTime = null;
    goToStep(1);
});

document.getElementById('btn-close-success').addEventListener('click', () => {
    document.getElementById('booking-success-modal').classList.remove('active');
});

/* ==================== ADMIN LOGIN ==================== */
document.getElementById('btn-admin-toggle').addEventListener('click', () => {
    if (AppState.isAdmin) {
        showAdmin();
    } else {
        document.getElementById('admin-login-modal').classList.add('active');
    }
});

document.getElementById('admin-login-close').addEventListener('click', () => {
    document.getElementById('admin-login-modal').classList.remove('active');
});

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    if (u === 'admin' && p === 'admin123') {
        AppState.isAdmin = true;
        document.getElementById('admin-login-modal').classList.remove('active');
        showAdmin();
        showToast('Welcome back, Zara!', 'success');
    } else {
        showToast('Invalid credentials', 'error');
    }
});

function showAdmin() {
    document.getElementById('public-site').style.display = 'none';
    navbar.style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    refreshAdminData();
}

document.getElementById('btn-admin-logout').addEventListener('click', () => {
    AppState.isAdmin = false;
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('public-site').style.display = '';
    navbar.style.display = '';
    showToast('Logged out successfully', 'info');
});

/* ==================== ADMIN SIDEBAR ==================== */
document.getElementById('sidebar-toggle-btn').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('collapsed');
});
document.getElementById('mobile-sidebar-toggle').addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('mobile-open');
});

document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const panel = link.dataset.panel;
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${panel}`).classList.add('active');
        document.getElementById('admin-page-title').textContent =
            panel.charAt(0).toUpperCase() + panel.slice(1);
        document.getElementById('admin-sidebar').classList.remove('mobile-open');
        if (panel === 'dashboard') refreshDashboard();
        if (panel === 'bookings') refreshBookingsTable();
        if (panel === 'calendar') renderAdminCalendar();
        if (panel === 'availability') renderAvailability();
        if (panel === 'clients') refreshClients();
    });
});

document.querySelectorAll('.view-all-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const panel = link.dataset.panel;
        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.classList.toggle('active', l.dataset.panel === panel);
        });
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${panel}`).classList.add('active');
        document.getElementById('admin-page-title').textContent =
            panel.charAt(0).toUpperCase() + panel.slice(1);
        refreshBookingsTable();
    });
});

/* ==================== ADMIN - REFRESH DATA ==================== */
function refreshAdminData() {
    refreshDashboard();
    refreshBookingsTable();
    renderAdminCalendar();
    renderAvailability();
    refreshClients();
}

function refreshDashboard() {
    const bookings = AppState.bookings;
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const pending = bookings.filter(b => b.status === 'pending');
    const revenue = confirmed.reduce((s, b) => s + b.price, 0)
        + bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0);

    document.getElementById('stat-total-bookings').textContent = bookings.length;
    document.getElementById('stat-confirmed').textContent = confirmed.length;
    document.getElementById('stat-pending').textContent = pending.length;
    document.getElementById('stat-revenue').textContent = `₹${revenue.toLocaleString()}`;

    // Upcoming
    const today = formatDate(new Date());
    const upcoming = bookings
        .filter(b => b.date >= today && b.status !== 'cancelled')
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .slice(0, 5);

    const upList = document.getElementById('upcoming-list');
    if (upcoming.length === 0) {
        upList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-xmark"></i><p>No upcoming bookings</p></div>';
    } else {
        upList.innerHTML = upcoming.map(b => {
            const d = new Date(b.date + 'T00:00:00');
            return `<div class="upcoming-item">
                <div class="upcoming-date"><span class="day">${d.getDate()}</span><span class="month">${months[d.getMonth()].slice(0,3)}</span></div>
                <div class="upcoming-info"><h4>${b.name}</h4><p>${b.service} · ${formatTime(b.time)}</p></div>
                <span class="status-badge ${b.status}">${b.status}</span>
            </div>`;
        }).join('');
    }

    // Service Breakdown
    const serviceCounts = {};
    const colors = ['#c9a84c', '#60a5fa', '#a78bfa', '#4ade80'];
    bookings.forEach(b => { serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1; });
    const sbContainer = document.getElementById('service-breakdown');
    const total = bookings.length || 1;
    if (Object.keys(serviceCounts).length === 0) {
        sbContainer.innerHTML = '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No data yet</p></div>';
    } else {
        let i = 0;
        sbContainer.innerHTML = Object.entries(serviceCounts).map(([name, count]) => {
            const pct = (count / total * 100).toFixed(0);
            const color = colors[i++ % colors.length];
            return `<div class="breakdown-item">
                <span class="breakdown-label">${name}</span>
                <div class="breakdown-bar-bg"><div class="breakdown-bar" style="width:${pct}%;background:${color};"></div></div>
                <span class="breakdown-count">${count}</span>
            </div>`;
        }).join('');
    }
}

/* ==================== ADMIN - BOOKINGS TABLE ==================== */
function refreshBookingsTable() {
    let bookings = [...AppState.bookings].reverse();
    const statusFilter = document.getElementById('filter-status').value;
    const serviceFilter = document.getElementById('filter-service').value;
    const search = document.getElementById('admin-search-input').value.toLowerCase();

    if (statusFilter !== 'all') bookings = bookings.filter(b => b.status === statusFilter);
    if (serviceFilter !== 'all') bookings = bookings.filter(b => b.service === serviceFilter);
    if (search) bookings = bookings.filter(b =>
        b.name.toLowerCase().includes(search) || b.id.toLowerCase().includes(search) || b.email.toLowerCase().includes(search)
    );

    const tbody = document.getElementById('bookings-tbody');
    const empty = document.getElementById('bookings-empty');

    if (bookings.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = '';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td><strong>${b.id}</strong></td>
                <td>${b.name}</td>
                <td>${b.service}</td>
                <td>${formatDateDisplay(b.date)}</td>
                <td>${formatTime(b.time)}</td>
                <td><span class="status-badge ${b.status}">${b.status}</span></td>
                <td>
                    <button class="action-btn" title="View" onclick="viewBooking('${b.id}')"><i class="fas fa-eye"></i></button>
                    ${b.status === 'pending' ? `<button class="action-btn" title="Confirm" onclick="updateStatus('${b.id}','confirmed')"><i class="fas fa-check"></i></button>` : ''}
                    ${b.status !== 'cancelled' && b.status !== 'completed' ? `<button class="action-btn danger" title="Cancel" onclick="updateStatus('${b.id}','cancelled')"><i class="fas fa-times"></i></button>` : ''}
                </td>
            </tr>
        `).join('');
    }
}

document.getElementById('filter-status').addEventListener('change', refreshBookingsTable);
document.getElementById('filter-service').addEventListener('change', refreshBookingsTable);
document.getElementById('admin-search-input').addEventListener('input', refreshBookingsTable);

window.viewBooking = function(id) {
    const b = AppState.bookings.find(x => x.id === id);
    if (!b) return;
    document.getElementById('booking-detail-content').innerHTML = `
        <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">Booking ID</div><div class="detail-value">${b.id}</div></div>
            <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="status-badge ${b.status}">${b.status}</span></div></div>
            <div class="detail-item"><div class="detail-label">Service</div><div class="detail-value">${b.service}</div></div>
            <div class="detail-item"><div class="detail-label">Price</div><div class="detail-value" style="color:var(--gold);">₹${b.price.toLocaleString()}</div></div>
            <div class="detail-item"><div class="detail-label">Date</div><div class="detail-value">${formatDateDisplay(b.date)}</div></div>
            <div class="detail-item"><div class="detail-label">Time</div><div class="detail-value">${formatTime(b.time)}</div></div>
            <div class="detail-item"><div class="detail-label">Client</div><div class="detail-value">${b.name}</div></div>
            <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${b.phone}</div></div>
            <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${b.email}</div></div>
            <div class="detail-item"><div class="detail-label">Occasion</div><div class="detail-value">${b.event || 'Not specified'}</div></div>
        </div>
        ${b.notes ? `<div class="detail-notes"><h4>Special Requests</h4><p>${b.notes}</p></div>` : ''}
    `;
    const actions = document.getElementById('booking-detail-actions');
    actions.innerHTML = '';
    if (b.status === 'pending') {
        actions.innerHTML += `<button class="btn btn-primary btn-sm" onclick="updateStatus('${b.id}','confirmed');closeDetailModal()"><i class="fas fa-check"></i> Confirm</button>`;
    }
    if (b.status === 'confirmed') {
        actions.innerHTML += `<button class="btn btn-primary btn-sm" onclick="updateStatus('${b.id}','completed');closeDetailModal()"><i class="fas fa-flag-checkered"></i> Complete</button>`;
    }
    if (b.status !== 'cancelled' && b.status !== 'completed') {
        actions.innerHTML += `<button class="btn btn-outline btn-sm" onclick="updateStatus('${b.id}','cancelled');closeDetailModal()"><i class="fas fa-times"></i> Cancel</button>`;
    }
    document.getElementById('booking-detail-modal').classList.add('active');
};

window.closeDetailModal = function() {
    document.getElementById('booking-detail-modal').classList.remove('active');
};
document.getElementById('booking-detail-close').addEventListener('click', closeDetailModal);

window.updateStatus = function(id, status) {
    const b = AppState.bookings.find(x => x.id === id);
    if (b) {
        b.status = status;
        saveState();
        refreshAdminData();
        showToast(`Booking ${status}`, 'success');
    }
};

/* ==================== ADMIN - CALENDAR ==================== */
function renderAdminCalendar() {
    const d = AppState.adminCalDate;
    const year = d.getFullYear(), month = d.getMonth();
    document.getElementById('admin-cal-title').textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const container = document.getElementById('admin-cal-days');
    container.innerHTML = '';

    for (let i = 0; i < firstDay; i++) container.innerHTML += '<div class="cal-day empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDate(date);
        const hasBooking = AppState.bookings.some(b => b.date === dateStr && b.status !== 'cancelled');
        const today = new Date(); today.setHours(0,0,0,0);

        const el = document.createElement('div');
        el.className = `cal-day${hasBooking ? ' has-booking' : ''}${date.getTime() === today.getTime() ? ' today' : ''}`;
        el.textContent = day;
        el.addEventListener('click', () => showCalDayDetail(dateStr));
        container.appendChild(el);
    }
}

document.getElementById('admin-cal-prev').addEventListener('click', () => {
    AppState.adminCalDate.setMonth(AppState.adminCalDate.getMonth() - 1);
    renderAdminCalendar();
});
document.getElementById('admin-cal-next').addEventListener('click', () => {
    AppState.adminCalDate.setMonth(AppState.adminCalDate.getMonth() + 1);
    renderAdminCalendar();
});

function showCalDayDetail(dateStr) {
    const dayBookings = AppState.bookings.filter(b => b.date === dateStr && b.status !== 'cancelled');
    document.getElementById('cal-detail-title').textContent = `Bookings for ${formatDateDisplay(dateStr)}`;
    const list = document.getElementById('cal-detail-list');
    if (dayBookings.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No bookings for this day</p></div>';
    } else {
        list.innerHTML = dayBookings.map(b => `
            <div class="upcoming-item" style="cursor:pointer;" onclick="viewBooking('${b.id}')">
                <div class="upcoming-date"><span class="day">${formatTime(b.time)}</span></div>
                <div class="upcoming-info"><h4>${b.name}</h4><p>${b.service}</p></div>
                <span class="status-badge ${b.status}">${b.status}</span>
            </div>
        `).join('');
    }
}

/* ==================== ADMIN - AVAILABILITY ==================== */
function renderAvailability() {
    const container = document.getElementById('availability-grid');
    container.innerHTML = Object.entries(AppState.availability).map(([day, config]) => `
        <div class="avail-day">
            <label>${day}</label>
            <div class="avail-toggle">
                <input type="checkbox" data-day="${day}" ${config.enabled ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </div>
            <div class="avail-times">
                <input type="time" value="${config.start}" data-day="${day}" data-type="start">
                <span>to</span>
                <input type="time" value="${config.end}" data-day="${day}" data-type="end">
            </div>
        </div>
    `).join('');

    renderBlockedDates();
}

document.getElementById('btn-save-availability').addEventListener('click', () => {
    document.querySelectorAll('.avail-day').forEach(row => {
        const day = row.querySelector('input[type="checkbox"]').dataset.day;
        AppState.availability[day] = {
            enabled: row.querySelector('input[type="checkbox"]').checked,
            start: row.querySelector('input[data-type="start"]').value,
            end: row.querySelector('input[data-type="end"]').value,
        };
    });
    saveState();
    showToast('Availability updated', 'success');
});

document.getElementById('btn-block-date').addEventListener('click', () => {
    const dateInput = document.getElementById('block-date-input');
    const reason = document.getElementById('block-reason').value.trim();
    if (!dateInput.value) return showToast('Select a date', 'error');

    const exists = AppState.blockedDates.findIndex(b => b.date === dateInput.value);
    if (exists >= 0) {
        AppState.blockedDates.splice(exists, 1);
        showToast('Date unblocked', 'info');
    } else {
        AppState.blockedDates.push({ date: dateInput.value, reason });
        showToast('Date blocked', 'success');
    }
    saveState();
    renderBlockedDates();
    dateInput.value = '';
    document.getElementById('block-reason').value = '';
});

function renderBlockedDates() {
    const list = document.getElementById('blocked-dates-list');
    list.innerHTML = AppState.blockedDates.map(b => `
        <div class="blocked-date-tag">
            <span>${formatDateDisplay(b.date)}${b.reason ? ` — ${b.reason}` : ''}</span>
            <span class="remove-block" onclick="removeBlock('${b.date}')"><i class="fas fa-times"></i></span>
        </div>
    `).join('');
}

window.removeBlock = function(date) {
    AppState.blockedDates = AppState.blockedDates.filter(b => b.date !== date);
    saveState();
    renderBlockedDates();
    showToast('Date unblocked', 'info');
};

/* ==================== ADMIN - CLIENTS ==================== */
function refreshClients() {
    const clientMap = {};
    AppState.bookings.forEach(b => {
        if (!clientMap[b.email]) {
            clientMap[b.email] = { name: b.name, phone: b.phone, email: b.email, count: 0, lastDate: b.date };
        }
        clientMap[b.email].count++;
        if (b.date > clientMap[b.email].lastDate) clientMap[b.email].lastDate = b.date;
    });
    const clients = Object.values(clientMap);
    const tbody = document.getElementById('clients-tbody');
    const empty = document.getElementById('clients-empty');

    if (clients.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = '';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = clients.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.email}</td>
                <td>${c.count}</td>
                <td>${formatDateDisplay(c.lastDate)}</td>
            </tr>
        `).join('');
    }
}

/* ==================== EXPORT CSV ==================== */
document.getElementById('btn-export-csv').addEventListener('click', () => {
    const headers = ['ID','Client','Service','Date','Time','Status','Phone','Email','Occasion','Notes','Price'];
    const rows = AppState.bookings.map(b => [b.id,b.name,b.service,b.date,b.time,b.status,b.phone,b.email,b.event,b.notes,b.price]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bookings_${formatDate(new Date())}.csv`;
    a.click();
    showToast('CSV exported', 'success');
});

/* ==================== UTILITIES ==================== */
function formatDate(d) {
    const date = d instanceof Date ? d : new Date(d);
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
}

function formatDateDisplay(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(time) {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${ampm}`;
}

function showToast(message, type = 'info') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3500);
}

/* ==================== SEED DEMO DATA ==================== */
if (AppState.bookings.length === 0) {
    const demoBookings = [
        { id: 'BK001', service: 'Bridal Mehndi', price: 15000, duration: '4-6 hrs', date: '2026-04-02', time: '10:00', name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@email.com', event: 'Wedding', notes: 'Traditional Rajasthani design preferred', status: 'confirmed', createdAt: '2026-03-25T10:00:00Z' },
        { id: 'BK002', service: 'Arabic Mehndi', price: 5000, duration: '1-2 hrs', date: '2026-04-05', time: '14:00', name: 'Ayesha Khan', phone: '+91 87654 32109', email: 'ayesha@email.com', event: 'Engagement', notes: '', status: 'pending', createdAt: '2026-03-26T14:00:00Z' },
        { id: 'BK003', service: 'Indo-Arabic Fusion', price: 8000, duration: '2-3 hrs', date: '2026-04-08', time: '11:00', name: 'Ritu Agarwal', phone: '+91 76543 21098', email: 'ritu@email.com', event: 'Sangeet', notes: 'Floral theme with peacock motifs', status: 'pending', createdAt: '2026-03-27T09:00:00Z' },
        { id: 'BK004', service: 'Party & Festival', price: 2000, duration: '30-60 min', date: '2026-03-30', time: '16:00', name: 'Sneha Patel', phone: '+91 65432 10987', email: 'sneha@email.com', event: 'Festival', notes: '', status: 'confirmed', createdAt: '2026-03-27T15:00:00Z' },
        { id: 'BK005', service: 'Bridal Mehndi', price: 18000, duration: '4-6 hrs', date: '2026-04-15', time: '09:00', name: 'Meera Reddy', phone: '+91 54321 09876', email: 'meera@email.com', event: 'Wedding', notes: 'Include feet design, dulha name hidden', status: 'confirmed', createdAt: '2026-03-28T08:00:00Z' },
    ];
    AppState.bookings = demoBookings;
    saveState();
}

/* ==================== INIT ==================== */
goToStep(1);
