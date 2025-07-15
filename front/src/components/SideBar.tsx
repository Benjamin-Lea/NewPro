import React, { useState } from 'react';
import { Button } from 'antd';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

const Sidebar = () => {
  const [visible, setVisible] = useState(false);
  const [showText, setShowText] = useState(false);

  const openSidebar = () => {
    setVisible(true);
    setTimeout(() => setShowText(true), 200); 
  };
  const closeSidebar = () => {
    setShowText(false);
    setTimeout(() => setVisible(false)); 
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: visible ? 240 : 40,
        transition: 'width 0.3s',
        background: '#f0f2f5',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 8, right: 0 }}>
        <Button
          type="text"
          size="small"
          onClick={visible ? closeSidebar : openSidebar}
        >
          {visible ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
        </Button>
      </div>
      {showText && (
        <div style={{ padding: '16px' }}>
          <h3>Sidebar</h3>
          <p>Your sidebar text goes here.</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

