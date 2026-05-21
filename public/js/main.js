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

// Update UI based on auth state
async function updateNavbar() {
    const user = await checkAuth();
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    if (user) {
        let dashboardLink = user.role === 'admin' ? '/admin.html' : '/dashboard.html';
        navLinks.innerHTML = `
            <a href="${dashboardLink}">Dashboard</a>
            <a href="/leaderboard.html">Leaderboard</a>
            <a href="/profile.html">Profile</a>
            <a href="#" onclick="logout(); return false;">Logout</a>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="/login.html" class="btn btn-outline">Login</a>
            <a href="/signup.html" class="btn">Sign Up</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
