import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceArea
} from 'recharts';

const SentimentChart = ({ data }) => {
  const emotionMap = {
    "-2": "Very Negative",
    "-1": "Negative",
    "0": "Neutral",
    "1": "Positive",
    "2": "Very Positive",
  };

  // Map normalized score (0-10) to discrete category (-2 to +2)
  const mapScoreToCategory = (score) => {
  if (score < 2.5) return -2;        // very negative
  if (score >= 2.5 && score < 4.5) return -1; // negative
  if (score >= 4.5 && score < 6) return 0;    // neutral
  if (score >= 6 && score < 8) return 1;      // positive
  return 2;                                   // very positive
};


  const mappedData = data.map(d => ({
    ...d,
    categoryScore: mapScoreToCategory(d.score),
  }));

 // Detect streaks for alert and coloring
const negativeLabels = [-2, -1];
const positiveLabels = [1, 2];
let consecutiveNeg = 0;
let consecutivePos = 0;
let alertNeg = false, alertPos = false;
const dotColors = [];
const streakAreas = [];
let startIndexNeg = null;
let startIndexPos = null;

// Iterate through data in order (oldest to newest)
mappedData.forEach((d, index) => {
  // Negative streak
  if (negativeLabels.includes(d.categoryScore)) {
    consecutiveNeg++;
    if (startIndexNeg === null) startIndexNeg = index;
  } else {
    if (consecutiveNeg >= 5) {
      streakAreas.push({ start: startIndexNeg, end: index - 1, color: "#fca5a5" });
      alertNeg = index === mappedData.length ? true : false; // alert only if streak is at the end
    }
    consecutiveNeg = 0;
    startIndexNeg = null;
  }

  // Positive streak
  if (positiveLabels.includes(d.categoryScore)) {
    consecutivePos++;
    if (startIndexPos === null) startIndexPos = index;
  } else {
    if (consecutivePos >= 5) {
      streakAreas.push({ start: startIndexPos, end: index - 1, color: "#bbf7d0" });
      alertPos = index === mappedData.length ? true : false; // alert only if streak is at the end
    }
    consecutivePos = 0;
    startIndexPos = null;
  }

  // Dot coloring
  if (negativeLabels.includes(d.categoryScore)) {
    dotColors.push(consecutiveNeg >= 5 ? "#b91c1c" : "#f87171");
  } else if (positiveLabels.includes(d.categoryScore)) {
    dotColors.push(consecutivePos >= 5 ? "#166534" : "#4ade80");
  } else {
    dotColors.push("#3b82f6"); // neutral
  }
});

// Add ongoing streaks if at the end of data
if (consecutiveNeg >= 5 && startIndexNeg !== null) {
  streakAreas.push({ start: startIndexNeg, end: mappedData.length - 1, color: "#fca5a5" });
  alertNeg = true;
}
if (consecutivePos >= 5 && startIndexPos !== null) {
  streakAreas.push({ start: startIndexPos, end: mappedData.length - 1, color: "#bbf7d0" });
  alertPos = true;
}

  const CustomDot = ({ cx, cy, index }) => (
    <circle cx={cx} cy={cy} r={4} fill={dotColors[index]} stroke="none" />
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {alertNeg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2">
           ⚠️ 5 Consecutive Negative Journal Entries Detected. Consider reviewing your mood.
  <br /><br />
  <strong>Suggestions:</strong>
  <br /><br />
  💬 Talk to a counselor or therapist.
  <br /><br />
  📝 Try journaling your thoughts and emotions daily.
  <br /><br />
  🧘 Engage in relaxing activities — meditation, yoga, or a walk.
  <br /><br />
  🤝 Reach out to friends or family for support.
  <br /><br />
  🧩 Review recent stressors and create an action plan.
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2 text-center">Sentiment Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mappedData} margin={{ left: 70, right: 20, top: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) =>
              new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            type="number"
            domain={[-2, 2]}
            ticks={[-2, -1, 0, 1, 2]}
            tickFormatter={(value) => emotionMap[value]}
            tick={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip
            formatter={(value) => emotionMap[value]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />

          {/* Highlight streak areas */}
          {streakAreas.map((area, idx) => (
            <ReferenceArea
              key={idx}
              x1={mappedData[area.start].date}
              x2={mappedData[area.end].date}
              y1={-2}
              y2={2}
              fill={area.color}
              fillOpacity={0.2}
            />
          ))}

          <Line
            type="monotone"
            dataKey="categoryScore"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={<CustomDot />}
          />
        </LineChart>
      </ResponsiveContainer>
      {alertPos && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-2">
          🎉 5 Consecutive Positive Journal Entries Detected! Keep up the good mood!
  <br /><br />
  <strong>Suggestions to continue your streak:</strong>
  <br /><br />
  📝 Keep journaling your thoughts and positive experiences daily.
  <br /><br />
  🌟 Celebrate small wins and milestones.
  <br /><br />
  📅 Reflect weekly on what made you feel good and plan for more of it.
        </div>
      )}
    </div>
    
  );
};

export default SentimentChart;
