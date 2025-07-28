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
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

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

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') || 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  if (error) return <p>Error: {error}</p>;

  const computedStyle = getComputedStyle(document.documentElement);
  const textColor = computedStyle.getPropertyValue('--color-text-2').trim();
  const paperBgColor = computedStyle.getPropertyValue('--color-background').trim();
  const plotBgColor = computedStyle.getPropertyValue('--color-primary').trim();
  const gridColor = computedStyle.getPropertyValue('--color-border').trim();
  const demandColor = computedStyle.getPropertyValue('--color-accent1').trim();
  const priceColor = computedStyle.getPropertyValue('--color-accent').trim();

  const layout = {
    title: 'Alberta Energy Demand & Pool Price Over Time',
    autosize: true,
    dragmode: false,
    paper_bgcolor: paperBgColor,
    plot_bgcolor: plotBgColor,
    yaxis: { 
      title: 'Demand (MW)',
      showgrid: true,
      zeroline: false,
      showticklabels: true,
      gridcolor: gridColor,
      titlefont: { color: textColor },
      tickfont: { color: textColor },
    },
    yaxis2: {
      title: 'Price ($/MWh)',
      overlaying: 'y',
      side: 'right',
      zeroline: true,
      showticklabels: true,
      titlefont: { color: textColor },
      tickfont: { color: textColor },
    },
    xaxis: {
      title: period === 'day' ? 'Hour' : period === 'week' ? 'Day' : period === 'month' || period === '6months' ? 'Month' : period === 'year' ? 'Year' : 'Date',
      tickformat: period === 'day' ? '%H:%M' : period === 'week' ? '%a %d' : '%Y-%m-%d',
      showline: true, showticklabels: true, titlefont: { color: textColor }, tickfont: { color: textColor }
    },
    margin: { t: 30, l: 50, r: 50, b: 40 },
    legend: { orientation: 'h', x: 0.5, y: 1.1, xanchor: 'center', font: { color: textColor },},
  };

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
            marker: { color: demandColor },
            line: { shape: 'spline' },
            hovertemplate: 'Demand: %{y} MW<br>Time: %{x}<extra></extra>',
          },
          {
            x: data.map((item) => item.dateBeginGMT),
            y: data.map((item) => item.actualPoolPrice),
            mode: 'lines',            
            name: 'Pool Price',
            marker: { color: priceColor },
            line: { shape: 'spline' },
            yaxis: 'y2',
            hovertemplate: 'Price: $%{y}/MWh<br>Time: %{x}<extra></extra>'
          },
        ]}
        layout={layout}
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
