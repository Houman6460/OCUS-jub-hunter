import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div>
        <h2>Features Implemented:</h2>
        <ul>
          <li>✓ Unified Login System</li>
          <li>✓ Social Authentication (Google, Facebook, GitHub)</li>
          <li>✓ CAPTCHA Security</li>
          <li>✓ Affiliate Program</li>
          <li>✓ Customer Dashboard</li>
          <li>✓ Admin Access</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/unified-login" style={{ 
          color: '#0066cc', 
          textDecoration: 'none',
          padding: '10px 20px',
          border: '1px solid #0066cc',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          Go to Unified Login →
        </a>
      </div>
    </div>
  );
}