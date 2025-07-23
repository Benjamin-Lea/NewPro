import EnergyDataGraph from '../components/EnergyDataGraph';
import Sidebar from '../components/SideBar';
import React from 'react';
import StatsWidget from '../components/StatsWidget';
import { Card, Col, Divider, Row, Statistic } from 'antd';

const DashBoard = () => {
  const [current, setCurrent] = React.useState<{ actualPoolPrice: number; actualAIL: number; hourAheadPoolPriceForecast: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = () => {
      setLoading(false);
      setError(null);
      fetch('http://localhost:3000/api/dashboard/currentdemand/')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch current demand');
          return res.json();
        })
        .then((json) => {
          setCurrent(json);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchData();
    intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Energy Dashboard</h1>
        <div style={{ width: '75%', margin: '0 auto' }}>
          <Row 
            gutter={[25, 100]}
            className="mb-8"
            justify="center"
            align="top"
          >
            <Col span={24}>
              <EnergyDataGraph />
            </Col>
          </Row>
          <Divider></Divider>
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
          <Row
            gutter={[25, 40]}
            justify="center"
            align="top"
          >
            <Col xs={24} sm={12} md={4}>
              <StatsWidget title="Current Price ($/MWh)" value={current?.actualPoolPrice ?? '-'} loading={loading} />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatsWidget title="Current Demand (MW)" value={current?.actualAIL ?? '-'} loading={loading} />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <StatsWidget title="Next Hour Forecast ($/MWh)" value={current?.hourAheadPoolPriceForecast ?? '-'} loading={loading} />
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};
export default DashBoard;
