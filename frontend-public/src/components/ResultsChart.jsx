import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './ResultsChart.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function ResultsChart({ analytics }) {
  if (analytics.poll_type === 'multiple_choice') {
    const chartData = {
      labels: analytics.options,
      datasets: [{
        label: 'Votes',
        data: analytics.options.map(opt => analytics.vote_distribution[opt] || 0),
        backgroundColor: [
          'rgba(236, 72, 153, 0.9)',    // Pink
          'rgba(139, 92, 246, 0.9)',    // Purple
          'rgba(59, 130, 246, 0.9)',    // Blue
          'rgba(251, 191, 36, 0.9)',    // Yellow
          'rgba(34, 197, 94, 0.9)',     // Green
          'rgba(249, 115, 22, 0.9)',    // Orange
          'rgba(244, 63, 94, 0.9)',     // Red
          'rgba(168, 85, 247, 0.9)',    // Violet
        ],
        borderWidth: 0,
        borderRadius: 10,
        hoverBackgroundColor: [
          'rgba(236, 72, 153, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(244, 63, 94, 1)',
          'rgba(168, 85, 247, 1)',
        ]
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 14,
              weight: '600'
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            lineWidth: 1
          }
        },
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              size: 14,
              weight: '700'
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fbbf24',
          bodyColor: '#fff',
          borderColor: '#ec4899',
          borderWidth: 2,
          padding: 12,
          bodyFont: {
            size: 16,
            weight: '600'
          },
          titleFont: {
            size: 14,
            weight: '700'
          }
        }
      }
    };

    return (
      <div className="results-chart">
        <h3>Live Results ({analytics.total_responses} votes)</h3>
        <div className="chart-container">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  }

  return (
    <div className="results-chart">
      <h3>All Responses ({analytics.total_responses})</h3>
      <div className="text-responses-list">
        {analytics.text_responses && analytics.text_responses.slice(0, 10).map((response) => (
          <div key={response.id} className="text-response-item">
            <p>"{response.answer}"</p>
          </div>
        ))}
        {analytics.text_responses && analytics.text_responses.length > 10 && (
          <p className="more-responses">+ {analytics.text_responses.length - 10} more responses</p>
        )}
      </div>
    </div>
  );
}

export default ResultsChart;
