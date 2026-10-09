import React from 'react';

// Sleek native Donut Chart
export const DonutChart = ({ data = [], labels = [], colors = ['#dc2626', '#10b981', '#f59e0b', '#3b82f6'], size = 180 }) => {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let accumulatedAngle = 0;

  const radius = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((value, idx) => {
          const sliceAngle = (value / total) * 360;
          if (value === 0) return null;

          const startAngle = accumulatedAngle;
          const endAngle = accumulatedAngle + sliceAngle;
          accumulatedAngle += sliceAngle;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);

          const largeArc = sliceAngle > 180 ? 1 : 0;
          const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={idx}
              d={pathData}
              fill={colors[idx % colors.length]}
              stroke="#ffffff"
              strokeWidth="3"
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            >
              <title>{`${labels[idx] || 'Item'}: ${value} (${Math.round((value / total) * 100)}%)`}</title>
            </path>
          );
        })}
        {/* Inner Cutout */}
        <circle cx={cx} cy={cy} r={radius * 0.55} fill="#ffffff" />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '1.1rem', fontWeight: 800, fill: 'var(--text-primary)' }}
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem' }}>
        {labels.map((label, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: colors[idx % colors.length],
                display: 'inline-block'
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{data[idx] || 0}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sleek native Horizontal Bar Chart
export const BarChart = ({ data = [], labels = [], barColor = 'var(--primary)' }) => {
  const max = Math.max(...data, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {labels.map((label, idx) => {
        const val = data[idx] || 0;
        const percentage = Math.round((val / max) * 100);

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>{label}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: barColor,
                  borderRadius: 4,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
