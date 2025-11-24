// public/script.js

// Adjust this if frontend & backend are on different hosts
// For same server (Express serving /public), keep it as empty string (relative URLs).
const API_BASE = ''; // '' means same origin, e.g. http://<LAN-IP>:3000

// Utility: simple email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

// Utility: show message
const showMessage = (elementId, text, type = '') => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('success', 'error');
  if (type) el.classList.add(type);
};

// Clear input error text
const clearErrors = (ids) => {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
};

// -------------------- SIGNUP LOGIC --------------------
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors([
      'signup-name-error',
      'signup-email-error',
      'signup-password-error',
      'signup-confirm-password-error'
    ]);
    showMessage('signup-message', '');

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    let valid = true;

    if (!name) {
      document.getElementById('signup-name-error').textContent = 'Name is required';
      valid = false;
    }

    if (!email) {
      document.getElementById('signup-email-error').textContent = 'Email is required';
      valid = false;
    } else if (!isValidEmail(email)) {
      document.getElementById('signup-email-error').textContent = 'Enter a valid email';
      valid = false;
    }

    if (!password) {
      document.getElementById('signup-password-error').textContent = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      document.getElementById('signup-password-error').textContent = 'Password must be at least 6 characters';
      valid = false;
    }

    if (!confirmPassword) {
      document.getElementById('signup-confirm-password-error').textContent = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      document.getElementById('signup-confirm-password-error').textContent = 'Passwords do not match';
      valid = false;
    }

    if (!valid) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('signup-message', data.message || 'Signup failed', 'error');
        return;
      }

      // Success: show OTP section
      showMessage('signup-message', data.message || 'Signup success. Check your email.', 'success');

      const otpSection = document.getElementById('otp-section');
      const otpEmailInput = document.getElementById('otp-email');

      if (otpSection && otpEmailInput) {
        otpSection.classList.remove('hidden');
        otpEmailInput.value = email;
      }
    } catch (error) {
      console.error('Signup error:', error);
      showMessage('signup-message', 'Network error. Please try again.', 'error');
    }
  });
}

// -------------------- OTP VERIFY & RESEND --------------------
const verifyOtpBtn = document.getElementById('verify-otp-btn');
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener('click', async () => {
    showMessage('otp-error', '');
    showMessage('signup-message', '');

    const email = document.getElementById('otp-email').value.trim();
    const otp = document.getElementById('otp-code').value.trim();

    if (!otp) {
      showMessage('otp-error', 'OTP is required');
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      showMessage('otp-error', 'OTP must be a 6-digit number');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('signup-message', data.message || 'OTP verification failed', 'error');
        return;
      }

      showMessage('signup-message', data.message || 'Account verified! You can now log in.', 'success');
    } catch (error) {
      console.error('Verify OTP error:', error);
      showMessage('signup-message', 'Network error. Please try again.', 'error');
    }
  });
}

const resendOtpBtn = document.getElementById('resend-otp-btn');
if (resendOtpBtn) {
  resendOtpBtn.addEventListener('click', async () => {
    showMessage('signup-message', '');
    showMessage('otp-error', '');

    const email = document.getElementById('otp-email').value.trim();

    if (!email) {
      showMessage('otp-error', 'Email is missing. Please sign up again.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('signup-message', data.message || 'Failed to resend OTP', 'error');
        return;
      }

      showMessage('signup-message', data.message || 'New OTP sent to your email.', 'success');
    } catch (error) {
      console.error('Resend OTP error:', error);
      showMessage('signup-message', 'Network error. Please try again.', 'error');
    }
  });
}

// -------------------- LOGIN LOGIC --------------------
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(['login-email-error', 'login-password-error']);
    showMessage('login-message', '');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let valid = true;

    if (!email) {
      document.getElementById('login-email-error').textContent = 'Email is required';
      valid = false;
    } else if (!isValidEmail(email)) {
      document.getElementById('login-email-error').textContent = 'Enter a valid email';
      valid = false;
    }

    if (!password) {
      document.getElementById('login-password-error').textContent = 'Password is required';
      valid = false;
    }

    if (!valid) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage('login-message', data.message || 'Login failed', 'error');
        return;
      }

      // Save token (optional)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      showMessage('login-message', data.message || 'Login successful', 'success');

      // You can redirect to a dashboard page, e.g.:
      // window.location.href = '/dashboard.html';
    } catch (error) {
      console.error('Login error:', error);
      showMessage('login-message', 'Network error. Please try again.', 'error');
    }
  });
}
