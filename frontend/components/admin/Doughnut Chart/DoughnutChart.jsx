
'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { api } from '@/lib/api';

export default function DoughnutChart() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch statistics from Backend
  useEffect(() => {
    api.get('/admin/stats')
      .then(setStats)
      .catch((err) => {
        console.error(err);
        setError('حدث خطأ أثناء تحميل الإحصائيات');
      })
      .finally(() => setLoading(false));
  }, []);

  // Convert API data into chart data
  const chartData = stats
    ? [
        {
          value: stats.companiesServed,
          name: 'الشركات التي تمت خدمتها',
        },
        {
          value: stats.totalWeightKg,
          name: 'إجمالي الوزن (كجم)',
        },
        {
          value: stats.activeOrders,
          name: 'طلبات جارية',
        },
        {
          value: stats.pendingCollectors,
          name: 'مندوبون في انتظار الموافقة',
        },
        {
          value: stats.noShows,
          name: 'حالات عدم استجابة',
        },
      ]
    : [];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },

    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      data: chartData.map((item) => item.name),
    },

    series: [
      {
        name: 'إحصائيات الإدارة',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['68%', '50%'],
        avoidLabelOverlap: false,

        label: {
          show: false,
          position: 'center',
        },

        labelLine: {
          show: false,
        },

        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{c}',
          },
        },

        data: chartData,
      },
    ],
  };

  if (loading) return <p>جاري تحميل الإحصائيات...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full min-w-0 rounded-xl bg-white p-4">
      <h2 className="mb-4 text-lg font-bold">
        إحصائيات لوحة الإدارة
      </h2>

      <ReactECharts
        option={option}
        style={{ height: '350px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
