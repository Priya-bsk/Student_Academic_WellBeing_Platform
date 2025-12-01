import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SentimentPieChart = ({ distribution }) => {
  if (!distribution) return null;

  const data = [
    { name: 'Very Positive', value: distribution['very-positive'] || 0 },
    { name: 'Positive', value: distribution['positive'] || 0 },
    { name: 'Neutral', value: distribution['neutral'] || 0 },
    { name: 'Negative', value: distribution['negative'] || 0 },
    { name: 'Very Negative', value: distribution['very-negative'] || 0 },
  ];

  // Pastel colors for emotions
  const COLORS = ['#4CAF50', '#81C784', '#FDD835', '#FF8A65', '#E57373'];

  const renderLabel = ({ name, percent }) => {
    if (percent === 0) return null;
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#555' }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: COLORS[index % COLORS.length],
                marginRight: 8,
                borderRadius: 4,
                boxShadow: '0 0 4px rgba(0,0,0,0.1)'
              }}
            />
            {entry.payload.value > 0 ? entry.payload.name : null}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-center">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50} // makes it a donut chart
            outerRadius={80}
            label={renderLabel}
            labelLine={true}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Entries']} />
          {/* <Legend verticalAlign="bottom" height={36} content={renderLegend} /> */}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentPieChart;
