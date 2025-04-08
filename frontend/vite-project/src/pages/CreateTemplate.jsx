import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState(''); // Track topic
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [publicStatus, setPublicStatus] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const newTemplate = {
      title,
      description,
      topic,  // Send topic with the request
      tags: tags.split(',').map(tag => tag.trim()),  // Convert tags to an array
      image,
      public: publicStatus,
    };

    try {
      const response = await fetch('http://localhost:5000/auth/createTemplate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Include the token here
        },
        body: JSON.stringify(newTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const result = await response.json();
      console.log(result);
      navigate('/dashboard');  // Navigate to the dashboard after successful creation
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create template. Please try again.');
    }
  };

  return (
    <div>
      <h2>Create New Template</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic"
          />
        </div>
        <div>
          <label>Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label>Image URL</label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div>
          <label>
            Public
            <input
              type="checkbox"
              checked={publicStatus}
              onChange={() => setPublicStatus(!publicStatus)}
            />
          </label>
        </div>
        <button type="submit">Create Template</button>
      </form>
    </div>
  );
};

export default CreateTemplatePage;
