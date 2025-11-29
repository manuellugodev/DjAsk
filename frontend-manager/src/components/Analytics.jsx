import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import socketService from '../services/socket';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Analytics({ poll, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();

    // Connect to socket for real-time updates
    socketService.connect();
    socketService.joinPoll(poll.id);

    socketService.onNewResponse((data) => {
      if (data.poll_id === poll.id) {
        loadAnalytics();
      }
    });

    return () => {
      socketService.leavePoll(poll.id);
      socketService.offNewResponse();
    };
  }, [poll.id]);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.getPollAnalytics(poll.id);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Failed to load analytics</div>;
  }

  const chartData = analytics.poll_type === 'multiple_choice' ? {
    labels: analytics.options,
    datasets: [{
      label: 'Votes',
      data: analytics.options.map(opt => analytics.vote_distribution[opt] || 0),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
    }]
  } : null;

  return (
    <div className="analytics">
      <div className="analytics-header">
        <button onClick={onBack} className="btn-back">← Back to List</button>
        <h2>{analytics.poll_title}</h2>
      </div>

      <div className="analytics-summary">
        <div className="summary-item">
          <h3>{analytics.total_responses}</h3>
          <p>Total Responses</p>
        </div>
        <div className="summary-item">
          <h3>{analytics.poll_type === 'multiple_choice' ? 'Multiple Choice' : 'Open Text'}</h3>
          <p>Poll Type</p>
        </div>
        <div className="summary-item">
          <h3>{analytics.is_active ? 'Active' : 'Inactive'}</h3>
          <p>Status</p>
        </div>
      </div>

      {analytics.poll_type === 'multiple_choice' && chartData && (
        <div className="charts-container">
          <div className="chart-box">
            <h3>Vote Distribution (Pie Chart)</h3>
            <Pie data={chartData} />
          </div>
          <div className="chart-box">
            <h3>Vote Distribution (Bar Chart)</h3>
            <Bar
              data={chartData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {analytics.poll_type === 'open_text' && analytics.text_responses && (
        <div className="text-responses">
          <h3>Text Responses ({analytics.text_responses.length})</h3>
          <div className="responses-list">
            {analytics.text_responses.map((response) => (
              <div key={response.id} className="response-item">
                <p>{response.answer}</p>
                <span className="response-date">
                  {new Date(response.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
