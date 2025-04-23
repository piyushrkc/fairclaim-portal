import React, { useState, useEffect } from 'react';
import CustomerPortal from './CustomerPortal';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

function App() {
  const hostname = window.location.hostname;

  const subdomain = hostname.split('.')[0];
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
  };

  if (subdomain === 'admin') {
    if (!isLoggedIn) {
      return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
    }
    return <AdminDashboard onLogout={handleLogout} />;
  } else {
    return <CustomerPortal />;
  }
}

export default App;