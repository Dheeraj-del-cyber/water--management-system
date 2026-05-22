// Common API fetch function
async function apiCall(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

// Check auth status
async function checkAuth() {
    try {
        const user = await apiCall('/auth/me');
        return user;
    } catch (error) {
        return null;
    }
}

// Handle Logout
async function logout() {
    try {
        await apiCall('/auth/logout', 'POST');
        window.location.href = '/login.html';
    } catch (error) {
        alert(error.message);
    }
}

function buildNavLink(url, label, isButton = false) {
    const active = window.location.pathname === url ? 'active' : '';
    const baseClass = isButton ? 'btn' : '';
    return `<a href="${url}" class="${baseClass} ${active}">${label}</a>`;
}

// Update UI based on auth state
async function updateNavbar() {
    const user = await checkAuth();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (user) {
        const dashboardLink = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
        navLinks.innerHTML = `
            ${buildNavLink(dashboardLink, 'Dashboard')}
            ${buildNavLink('/leaderboard.html', 'Leaderboard')}
            ${buildNavLink('/profile.html', 'Profile')}
            <a href="#" onclick="logout(); return false;">Logout</a>
        `;
    } else {
        navLinks.innerHTML = `
            ${buildNavLink('/login.html', 'Login', true)}
            ${buildNavLink('/signup.html', 'Sign Up', true)}
        `;
    }
}

function easeOutQuad(t) {
    return t * (2 - t);
}

function animateValue(element, start, end, duration = 900) {
    if (!element) return;
    const range = end - start;
    const startTime = performance.now();

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.floor(start + range * easeOutQuad(progress));
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateDashboardProgress(points) {
    const level = Math.max(1, Math.floor(points / 100) + 1);
    const currentLevelPoints = points % 100;
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');
    const levelElement = document.getElementById('ecoLevel');

    if (levelElement) {
        levelElement.textContent = level;
    }
    if (progressLabel) {
        progressLabel.textContent = `${currentLevelPoints} / 100 points`;
    }
    if (progressFill) {
        progressFill.style.width = `${Math.min(100, currentLevelPoints)}%`;
    }
}

function animateDashboardStats(data) {
    animateValue(document.getElementById('todayUsed'), 0, data.todayUsed);
    animateValue(document.getElementById('totalUsed'), 0, data.totalUsed);
    animateValue(document.getElementById('ecoPoints'), 0, data.ecoPoints);
    updateDashboardProgress(data.ecoPoints);
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
