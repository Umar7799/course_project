import React, { useState } from 'react';

const AddQuestionForm = ({ templateId }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('SINGLE_LINE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text || !type) {
      setError('Both text and type are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/auth/templates/${templateId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, type }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to add question');
        setSuccess('');
        return;
      }

      setSuccess('Question added successfully!');
      setError('');
      setText('');
      setType('SINGLE_LINE');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Add Question to Template</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Question Text:</label><br />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter question"
            required
          />
        </div>
        <div>
          <label>Type:</label><br />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="SINGLE_LINE">Single Line</option>
            <option value="MULTI_LINE">Multi Line</option>
            <option value="INTEGER">Integer</option>
            <option value="CHECKBOX">Checkbox</option>
          </select>
        </div>
        <button type="submit">Add Question</button>
      </form>
    </div>
  );
};

export default AddQuestionForm;
