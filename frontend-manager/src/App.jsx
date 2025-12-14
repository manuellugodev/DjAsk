import { useState, useEffect } from 'react';
import { pollAPI, analyticsAPI } from './services/api';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'analytics'
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadPolls();
      loadSummary();
    }
  }, [isAuthenticated]);

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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show main app if authenticated
  return (
    <div className="App">
      <Header />

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
