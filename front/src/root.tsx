import React, { useEffect, useState } from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <>
      <button className="theme-toggle"
        style={{ border: 'none', background: 'transparent' }}
        onClick={toggleTheme}>
        {theme === 'light' ? (
          <>
            <SunOutlined style={{ marginRight: 4 }} />
                      </>
        ) : (
          <>
            <MoonOutlined style={{ marginRight: 4 }} />
          </>
        )}
      </button>
    {children}
    </>
  )
};

export default Root;

