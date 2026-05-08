const AuthManager = {
  get isAdmin() {
    return localStorage.getItem('isAdmin') === 'true' && 
           localStorage.getItem('adminToken') !== null;
  },

  get token() {
    return localStorage.getItem('adminToken');
  },

  async login(pin) {
    try {
      const res = await fetch('api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminToken', data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  logout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
  }
};

// عند الضغط على زر المسؤول
async function showAdminLogin() {
  if (AuthManager.isAdmin) {
    if (confirm('فتح لوحة تحكم المسؤول؟')) {
      location.href = 'admin.html';
    }
    return;
  }

  const pin = prompt('أدخل الرمز السري للمسؤول:');
  if (!pin) return;

  const success = await AuthManager.login(pin);
  if (success) {
    alert('✅ تم تسجيل الدخول بنجاح');
    location.href = 'admin.html';
  } else {
    alert('❌ الرمز السري غير صحيح');
  }
}
