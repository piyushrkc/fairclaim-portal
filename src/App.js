import React from 'react';
import CustomerPortal from './CustomerPortal';
import AdminDashboard from './AdminDashboard';

function App() {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0]; // portal or admin

  if (subdomain === 'admin') {
    return <AdminDashboard />;
  } else {
    return <CustomerPortal />;
  }
}

export default App;