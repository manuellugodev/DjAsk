import { useState, useEffect } from 'react';
import { pollAPI, analyticsAPI } from '../services/api';
import socketService from '../services/socket';
import ResultsChart from './ResultsChart';
import './PollView.css';

function PollView({ poll, onBack }) {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submitted) {
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
    }
  }, [submitted, poll.id]);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.getPollAnalytics(poll.id);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleMultipleChoiceChange = (option) => {
    if (poll.allow_multiple) {
      if (selectedAnswers.includes(option)) {
        setSelectedAnswers(selectedAnswers.filter(a => a !== option));
      } else {
        setSelectedAnswers([...selectedAnswers, option]);
      }
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let answer;
      if (poll.poll_type === 'multiple_choice') {
        answer = poll.allow_multiple ? selectedAnswers : selectedAnswers[0];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          alert('Please select an answer');
          setLoading(false);
          return;
        }
      } else {
        answer = textAnswer.trim();
        if (!answer) {
          alert('Please enter your answer');
          setLoading(false);
          return;
        }
      }

      await pollAPI.submitResponse(poll.id, answer);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="poll-view submitted">
        <div className="success-message">
          <h2>Thank you for voting!</h2>
          <p>Here are the live results</p>
        </div>

        {analytics && <ResultsChart analytics={analytics} />}

        <button onClick={onBack} className="btn-back">
          View Other Polls
        </button>
      </div>
    );
  }

  return (
    <div className="poll-view">
      <button onClick={onBack} className="btn-back-small">← Back</button>

      <div className="poll-content">
        <h2>{poll.title}</h2>
        {poll.description && <p className="poll-description">{poll.description}</p>}

        <form onSubmit={handleSubmit}>
          {poll.poll_type === 'multiple_choice' ? (
            <div className="options-container">
              {poll.options.map((option, index) => (
                <label key={index} className="option-label">
                  <input
                    type={poll.allow_multiple ? 'checkbox' : 'radio'}
                    name="poll-option"
                    value={option}
                    checked={selectedAnswers.includes(option)}
                    onChange={() => handleMultipleChoiceChange(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
              {poll.allow_multiple && (
                <p className="helper-text">You can select multiple options</p>
              )}
            </div>
          ) : (
            <div className="text-input-container">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter your answer here..."
                rows="6"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PollView;
