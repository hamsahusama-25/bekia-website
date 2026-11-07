
'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { api } from '@/lib/api';
import { TRASH_AR } from '@/components/ui';

export default function WasteChart() {
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    api.get('/admin/pickups?status=APPROVED')
      .then(setPickups)
      .catch(console.error);
  }, []);

  // Calculate total weight for each waste type
  const wasteTotals = {};

  pickups.forEach((pickup) => {
    pickup.items?.forEach((item) => {
      const type = item.trashType;

      wasteTotals[type] =
        (wasteTotals[type] || 0) + item.weightKg;
    });
  });

  const labels = Object.keys(wasteTotals).map(
    (type) => TRASH_AR[type] || type
  );

  const values = Object.values(wasteTotals);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} كجم',
    },
    grid: {
    left: '8%',
    right: '8%',
    bottom: '12%',
    containLabel: true,
  },

    
    

    xAxis: {
      type: 'category',
      data: labels,
    },

    yAxis: {
      type: 'value',
      name: 'الوزن (كجم)',
    },

    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: {
          color: '#059669',
          borderRadius: [6, 6, 0, 0],
        },
        barWidth: '25%',
      },
    ],
  };

  return (
    <div className=" w-full min-w-0 max-w-full overflow-hidden rounded-xl bg-white p-4">
      <h2 className="mb-4 text-lg font-bold">
        إجمالي المخلفات حسب النوع
      </h2>

      <ReactECharts
        option={option}
  style={{
    height: '350px',
    width: '100%',
    maxWidth: '100%',
  }}
  opts={{ renderer: 'canvas' }}
  notMerge={true}
  lazyUpdate={true}
      />
    </div>
  );
}
