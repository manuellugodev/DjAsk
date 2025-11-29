import { useState, useEffect } from 'react';
import { pollAPI } from './services/api';
import PollView from './components/PollView';
import PollSelector from './components/PollSelector';
import './App.css';

function App() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivePolls();
  }, []);

  const loadActivePolls = async () => {
    try {
      const response = await pollAPI.getActive();
      setPolls(response.data);
      if (response.data.length === 1) {
        setSelectedPoll(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollSelect = (poll) => {
    setSelectedPoll(poll);
  };

  const handleBack = () => {
    setSelectedPoll(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>djask</h1>
        <p>Interactive Polling System</p>
      </header>

      <div className="container">
        {loading ? (
          <div className="loading">Loading polls...</div>
        ) : polls.length === 0 ? (
          <div className="no-polls-message">
            <h2>No active polls at the moment</h2>
            <p>Check back later!</p>
          </div>
        ) : selectedPoll ? (
          <PollView poll={selectedPoll} onBack={handleBack} />
        ) : (
          <PollSelector polls={polls} onSelect={handlePollSelect} />
        )}
      </div>
    </div>
  );
}

export default App;
