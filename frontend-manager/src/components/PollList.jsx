import { useState } from 'react';
import { pollAPI } from '../services/api';
import './PollList.css';

function PollList({ polls, onDelete, onViewAnalytics, onRefresh }) {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'

  const handleToggleActive = async (poll) => {
    try {
      await pollAPI.update(poll.id, { is_active: !poll.is_active });
      onRefresh();
    } catch (error) {
      console.error('Error updating poll:', error);
    }
  };

  const handleDelete = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      onDelete(pollId);
    }
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'active') return poll.is_active;
    if (filter === 'inactive') return !poll.is_active;
    return true;
  });

  return (
    <div className="poll-list">
      <div className="list-header">
        <h2>All Polls ({filteredPolls.length})</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={filter === 'inactive' ? 'active' : ''}
            onClick={() => setFilter('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="no-polls">
          <p>No polls found</p>
        </div>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => (
            <div key={poll.id} className="poll-card">
              <div className="poll-header">
                <h3>{poll.title}</h3>
                <span className={`status-badge ${poll.is_active ? 'active' : 'inactive'}`}>
                  {poll.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}

              <div className="poll-meta">
                <span>Type: {poll.poll_type === 'multiple_choice' ? 'Multiple Choice' : 'Open Text'}</span>
                <span>Responses: {poll.response_count}</span>
              </div>

              <div className="poll-actions">
                <button
                  onClick={() => onViewAnalytics(poll)}
                  className="btn-analytics"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => handleToggleActive(poll)}
                  className="btn-toggle"
                >
                  {poll.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(poll.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PollList;
