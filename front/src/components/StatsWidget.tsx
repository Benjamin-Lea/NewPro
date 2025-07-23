import React from 'react';
import { Card, Statistic } from 'antd';

const StatsWidget = ({ loading, value, title = "Current Value" }) => (
    <div
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-primary)',
        borderRadius: 4,
        padding: 12,
        display: 'inline-block',
        color: 'var(--color-text)'
      }}
    >
      <Statistic
        title={<span style={{ color: 'var(--color-text)' }}>{title}</span>}
        loading={loading}
        value={value}
        valueStyle={{ fontSize: 12, color: 'var(--color-text-2)' }}
      />
    </div>
);
export default StatsWidget;
