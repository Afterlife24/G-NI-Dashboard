import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const SubmissionsChart = ({ data, type }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Submissions per day',
        data: Object.values(data),
        backgroundColor: type === 'bar' ? 'rgba(31, 90, 170, 0.8)' : 'rgba(31, 90, 170, 0.1)',
        borderColor: 'rgba(31, 90, 170, 1)',
        borderWidth: 2,
        borderRadius: type === 'bar' ? 4 : 0,
        tension: type === 'line' ? 0.4 : 0,
        pointBackgroundColor: 'rgba(31, 90, 170, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(13, 60, 127, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.7)',
        },
      },
    },
  };

  return (
    <div className="chart-wrapper" style={{ height: '100%', width: '100%' }}>
      {type === 'bar' ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default SubmissionsChart;