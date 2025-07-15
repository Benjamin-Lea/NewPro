import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Button } from 'antd';

type EnergyMarketData = {
  id: string;
  dateBeginGMT: string;
  actualPoolPrice: number;
  actualAIL: number;
  hourAheadPoolPriceForecast: number;
  exportBC: number;
  exportMT: number;
  exportSK: number;
  importBC: number;
  importMT: number;
  importSK: number;
};

const PERIODS = ['day', 'week', 'month', '6months', 'year', 'all'];

const EnergyDataGraph: React.FC = () => {
  const [data, setData] = useState<EnergyMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('day');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3000/api/energymarket/period/${period}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((json: EnergyMarketData[]) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ width: '75%', height: '30vh', alignSelf: 'center', margin: '0 auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        {PERIODS.map((p) => (
          <Button
            key={p}
            type={period === p ? 'primary' : 'default'}
            onClick={() => setPeriod(p)}
            style={{ marginRight: '0.5rem' }}
          >
            {p}
          </Button>
        ))}
      </div>
      <Plot
        data={[
          {
            x: data.map((item) => item.dateBeginGMT),
            y: data.map((item) => item.actualAIL),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Actual AIL',
            marker: { color: 'blue' },
          },
          {
            x: data.map((item) => item.dateBeginGMT),
            y: data.map((item) => item.actualPoolPrice),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Actual Pool Price',
            marker: { color: 'red' },
            yaxis: 'y2',
          },
        ]}
        layout={{
          title: 'Actual AIL & Pool Price Over Time',
          autosize: true,
          yaxis: { title: 'Actual AIL' },
          yaxis2: {
            title: 'Price',
            overlaying: 'y',
            side: 'right',
          },
          margin: { t: 30, l: 50, r: 50, b: 40 },
          legend: { orientation: 'h', x: 0.5, y: 1.1, xanchor: 'center' },
        }}
        config={{ displaylogo: false }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default EnergyDataGraph;
