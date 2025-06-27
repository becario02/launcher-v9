"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Surtido", value: 350 },
  { name: "Surtido Parcialmente", value: 179 },
  { name: "Sin surtir", value: 421 },
];

const COLORS = ["#165BAA", "#8CD1FF", "#3CA6E0"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
      className="drop-shadow"
    >
      {data[index].value}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white text-black px-3 py-1 rounded shadow text-sm border border-gray-300">
        <strong>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

const InsumosPieChart = () => {
  return (
    <div className="w-full bg-white dark:bg-[#1C1C24] rounded-lg p-4 shadow relative overflow-visible">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">
        Insumos de OT's
      </h2>
      <ResponsiveContainer width="100%" minHeight={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              marginTop: "10px",
              color: "#888",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              gap: "10px",
              paddingLeft: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsumosPieChart;
