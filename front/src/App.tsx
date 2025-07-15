import { useState } from 'react';

import './App.css';
import React from 'react';
import Sidebar from './components/SideBar.tsx';

function App() {
  const [count, setCount] = useState<number>(0);
  return (
    <>
      <Sidebar />
    </>
  );
}

export default App;
