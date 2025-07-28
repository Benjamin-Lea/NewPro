import { useState } from 'react';

import './App.css';
import React from 'react';
import Sidebar from './components/SideBar.tsx';

function App() {
  const [count, setCount] = useState<number>(0);
  return (
    <>
      <a href="/dashboard">Go to Dashboard</a>
      <Sidebar />
    </>
  );
}

export default App;
