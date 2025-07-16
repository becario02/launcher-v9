"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTokenManager } from '@/hooks/useTokenManager';

const COLORS = ["#165BAA", "#8CD1FF", "#3CA6E0"];
const RADIAN = Math.PI / 180;

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  payload,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percentage = (percent * 100).toFixed(1);
  const value = payload?.value ?? 0;

  if (percentage < 0.1) return null;

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
      {`${percentage}% (${value})`}
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
  const [data, setData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const { tokenizedRequest, isProcessingTokens, tokenError, clearTokenError } = useTokenManager();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await tokenizedRequest('/mserpservice/api/tableros/mantenimiento', {
          method: 'GET',
        });

        const loadedData = [
          {
            name: `Surtido (${result.data.surtido})`,
            value: result.data.surtido
          },
          {
            name: `Surtido Parcialmente (${result.data.surtidoParcialmente})`,
            value: result.data.surtidoParcialmente
          },
          {
            name: `Sin surtir (${result.data.sinSurtir})`,
            value: result.data.sinSurtir
          }
        ];


        const total = loadedData.reduce((acc, d) => acc + d.value, 0);

        if (total === 0) {
          setData([]); 
        } else {
          setData(loadedData);
        }
      } catch (err) {
        console.error("Error al cargar insumos:", err);
        setHasError(true);
        setData([]); 
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-[#1C1C24] rounded-lg p-4 shadow relative overflow-visible">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">
        Insumos de OT's
      </h2>

      {data === null ? (
        // Loader
        <div className="w-full h-[250px] flex items-center justify-center">
          <div className="animate-pulse h-32 w-32 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
      ) : hasError ? (
        // Error
        <div className="text-center text-sm text-red-600 dark:text-red-400 h-[250px] flex items-center justify-center">
          Ocurrió un error al cargar los datos.
        </div>
      ) : data.length === 0 ? (
        // No data
        <div className="text-center text-sm text-gray-600 dark:text-gray-300 h-[250px] flex items-center justify-center">
          No hay datos disponibles para mostrar.
        </div>
      ) : (
        // Chart
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
      )}
    </div>
  );
};

export default InsumosPieChart;