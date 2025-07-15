import EnergyDataGraph from '../components/EnergyDataGraph';
import React, { useState } from 'react';
import { Button, Drawer } from 'antd';

const EnergyPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Responsive check for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', height: '100vh' }}>
      {isMobile ? (
        <>
          <Button
            type="text"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              top: 16,
              left: 8,
              zIndex: 2,
              padding: 0,
              width: 24,
              height: 24,
            }}
            icon={
              sidebarOpen ? (
                <span style={{ fontSize: 18 }}>{'↑'}</span>
              ) : (
                <span style={{ fontSize: 18 }}>{'↓'}</span>
              )
            }
          />
          {sidebarOpen && (
            <div style={{ marginTop: 56, padding: '0 16px', textAlign: 'left', background: '#f0f2f5' }}>
              <h3>About This App</h3>
              <p>
                This application visualizes energy market data, including Actual AIL and Pool Price over time.
                Use the period buttons to filter the data. The chart updates automatically.
              </p>
            </div>
          )}
          <div style={{ flex: 1, padding: '20px' }}>
            <h1>Energy Dashboard</h1>
            <EnergyDataGraph />
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              width: sidebarOpen ? 300 : 40,
              transition: 'width 0.2s',
              background: '#f0f2f5',
              height: '100%',
              position: 'relative',
              boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button
              type="text"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                position: 'absolute',
                top: 16,
                left: sidebarOpen ? 260 : 8,
                zIndex: 2,
                padding: 0,
                width: 24,
                height: 24,
              }}
              icon={
                sidebarOpen ? (
                  <span style={{ fontSize: 18 }}>{'←'}</span>
                ) : (
                  <span style={{ fontSize: 18 }}>{'→'}</span>
                )
              }
            />
            {sidebarOpen && (
              <div style={{ marginTop: 56, padding: '0 16px', textAlign: 'left' }}>
                <h3>About This App</h3>
                <p>
                  This application visualizes energy market data, including Actual AIL and Pool Price over time.
                  Use the period buttons to filter the data. The chart updates automatically.
                </p>
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: '20px' }}>
            <h1>Energy Dashboard</h1>
            <EnergyDataGraph />
          </div>
        </>
      )}
    </div>
  );
};

export default EnergyPage;
