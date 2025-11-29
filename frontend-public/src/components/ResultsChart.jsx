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
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 0,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
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
