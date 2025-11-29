import { useState, useEffect } from 'react';
import { pollAPI, analyticsAPI } from './services/api';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'analytics'
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadPolls();
    loadSummary();
  }, []);

  const loadPolls = async () => {
    try {
      const response = await pollAPI.getAll();
      setPolls(response.data);
    } catch (error) {
      console.error('Error loading polls:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await analyticsAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handlePollCreated = () => {
    loadPolls();
    loadSummary();
    setView('list');
  };

  const handlePollDeleted = async (pollId) => {
    try {
      await pollAPI.delete(pollId);
      loadPolls();
      loadSummary();
    } catch (error) {
      console.error('Error deleting poll:', error);
    }
  };

  const handleViewAnalytics = (poll) => {
    setSelectedPoll(poll);
    setView('analytics');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>djask Manager</h1>
        <p>Interactive Polling System - Admin Panel</p>
      </header>

      <div className="container">
        {summary && (
          <div className="summary-cards">
            <div className="summary-card">
              <h3>{summary.total_polls}</h3>
              <p>Total Polls</p>
            </div>
            <div className="summary-card">
              <h3>{summary.active_polls}</h3>
              <p>Active Polls</p>
            </div>
            <div className="summary-card">
              <h3>{summary.total_responses}</h3>
              <p>Total Responses</p>
            </div>
          </div>
        )}

        <div className="view-controls">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            Poll List
          </button>
          <button
            className={view === 'create' ? 'active' : ''}
            onClick={() => setView('create')}
          >
            Create New Poll
          </button>
        </div>

        {view === 'list' && (
          <PollList
            polls={polls}
            onDelete={handlePollDeleted}
            onViewAnalytics={handleViewAnalytics}
            onRefresh={loadPolls}
          />
        )}

        {view === 'create' && (
          <CreatePoll onPollCreated={handlePollCreated} />
        )}

        {view === 'analytics' && selectedPoll && (
          <Analytics poll={selectedPoll} onBack={() => setView('list')} />
        )}
      </div>
    </div>
  );
}

export default App;
