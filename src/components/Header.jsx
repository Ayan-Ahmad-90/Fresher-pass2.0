import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ padding: '1rem', backgroundColor: '#282c34', color: 'white' }}>
      <h1>FresherPass Portal</h1>
      <nav>
        <Link to="/" style={{ marginRight: '1rem', color: 'white' }}>Register</Link>
        <Link to="/verify" style={{ marginRight: '1rem', color: 'white' }}>Verify</Link>
        <Link to="/admin" style={{ color: 'white' }}>Admin</Link>
      </nav>
    </header>
  );
};

export default Header;
