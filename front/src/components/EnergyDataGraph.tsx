import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Button } from 'antd';

type EnergyMarketData = {
  id: string;
  dateBeginGMT: string;
  actualPoolPrice: number;
  actualAIL: number;
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
    // TODO: Make the endpoints from a api/file that is configurable 
    fetch(`http://localhost:3000/api/dashboard/pricedemand/period/${period}`)
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

  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ alignSelf: 'center', margin: '50' }}>
      <div style={{ marginBottom: '1rem' }}>
        {PERIODS.map((p) => (
          <Button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              marginRight: '0.5rem',
              backgroundColor: period === p ? 'var(--color-primary)' : 'var(--color-background)',
              color: period === p ? 'var(--color-text)' : 'var(--color-secondary)',
              boxShadow: 'none',
              border: '1px solid var(--color-border)',
            }}
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
            mode: 'lines',
            name: 'Alberta Energy Demand',
            marker: { color: 'blue' },
            line: { shape: 'spline' },
            hovertemplate: 'Demand: %{y} MW<br>Time: %{x}<extra></extra>',
          },
          {
            x: data.map((item) => item.dateBeginGMT),
            y: data.map((item) => item.actualPoolPrice),
            mode: 'lines',
            name: 'Pool Price',
            marker: { color: 'green'},
            line: { shape: 'spline' },
            yaxis: 'y2',
            hovertemplate: 'Price: $%{y}/MWh<br>Time: %{x}<extra></extra>'
          },
        ]}
        layout={{
          title: 'Alberta Energy Demand & Pool Price Over Time',
          autosize: true,
          dragmode: false,
          paper_bgcolor: "#2b2b2b", 
          plot_bgcolor: "#2b2b2b", 
          yaxis: {
            title: 'Demand (MW)',
            showgrid: true,
            zeroline: false,
            showticklabels: true,
            hovertemplate: 'Demand: %{y} MW<br>Time: %{x}<extra></extra>',
            gridcolor: "grey",
            titlefont: { color: "white" },
            tickfont: { color: "white" },
          },
          yaxis2: {
            title: 'Price ($/MWh)',
            overlaying: 'y',
            side: 'right',
            zeroline: true,
            showticklabels: true,
            titlefont: { color: "white" },
            tickfont: { color: "white" },
          },
          xaxis: {
            title:
              period === 'day'
                ? 'Hour'
                : period === 'week'
                ? 'Day'
                : period === 'month' || period === '6months'
                ? 'Month'
                : period === 'year'
                ? 'Year'
                : 'Date',
            tickformat:
              period === 'day'
                ? '%H:%M'
                : period === 'week'
                ? '%a %d'
                : '%Y-%m-%d',
            showline: true,
            showticklabels: true,
            titlefont: { color: "white" },
            tickfont: { color: "white" },

          },
          margin: { t: 30, l: 50, r: 50, b: 40 },
          legend: { orientation: 'h', x: 0.5, y: 1.1, xanchor: 'center' },
        }}
        config={{
          displaylogo: false,
          displayModeBar: false,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default EnergyDataGraph;
