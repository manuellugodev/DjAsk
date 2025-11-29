import './PollSelector.css';

function PollSelector({ polls, onSelect }) {
  return (
    <div className="poll-selector">
      <h2>Select a Poll</h2>
      <div className="polls-grid">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="poll-card"
            onClick={() => onSelect(poll)}
          >
            <h3>{poll.title}</h3>
            {poll.description && <p>{poll.description}</p>}
            <div className="poll-info">
              <span>{poll.poll_type === 'multiple_choice' ? 'Multiple Choice' : 'Open Text'}</span>
              <span>{poll.response_count} responses</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollSelector;
