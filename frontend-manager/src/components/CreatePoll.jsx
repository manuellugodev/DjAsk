import { useState } from 'react';
import { pollAPI } from '../services/api';
import './CreatePoll.css';

function CreatePoll({ onPollCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState('multiple_choice');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pollData = {
        title,
        description,
        poll_type: pollType,
        allow_multiple: allowMultiple,
      };

      if (pollType === 'multiple_choice') {
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          alert('Please provide at least 2 options');
          setLoading(false);
          return;
        }
        pollData.options = validOptions;
      }

      await pollAPI.create(pollData);
      onPollCreated();

      // Reset form
      setTitle('');
      setDescription('');
      setPollType('multiple_choice');
      setOptions(['', '']);
      setAllowMultiple(false);
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter poll title"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Poll Type *</label>
          <select value={pollType} onChange={(e) => setPollType(e.target.value)}>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="open_text">Open Text</option>
          </select>
        </div>

        {pollType === 'multiple_choice' && (
          <>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={allowMultiple}
                  onChange={(e) => setAllowMultiple(e.target.checked)}
                />
                Allow multiple selections
              </label>
            </div>

            <div className="form-group">
              <label>Options *</label>
              {options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="btn-add-option"
              >
                + Add Option
              </button>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Creating...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}

export default CreatePoll;
