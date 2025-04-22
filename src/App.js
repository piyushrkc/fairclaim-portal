import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerPortal from './CustomerPortal';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;