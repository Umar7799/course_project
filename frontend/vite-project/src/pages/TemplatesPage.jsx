import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state
  const [selectedTopic, setSelectedTopic] = useState(''); // Track selected topic
  const [topics, setTopics] = useState([]); // Store the available topics

  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get('http://localhost:5000/auth/templates', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        // Decode user role
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userRole = decodedToken.role;
  
        // Get unique topics from the templates
        const topicsSet = new Set(response.data.map(template => template.topic));
        setTopics([...topicsSet]);

        // Filter templates based on role and selected topic
        const filteredTemplates = response.data.filter(template => {
          const topicMatch = selectedTopic ? template.topic === selectedTopic : true;
          return (userRole === 'ADMIN' || template.isPublic === true) && topicMatch;
        });
  
        setTemplates(filteredTemplates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('There was an error fetching the templates.');
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedTopic]); // Re-fetch templates whenever selectedTopic changes

  if (loading) {
    return <div>Loading templates...</div>; // Show loading message while fetching data
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>; // Show error message
  }

  return (
    <div className="container mt-5">
      <h2>Templates</h2>
      
      {/* Topic Filter */}
      <div className="mb-3">
        <label htmlFor="topicSelect" className="form-label">Filter by Topic</label>
        <select
          id="topicSelect"
          className="form-select"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">All Topics</option>
          {topics.map((topic, index) => (
            <option key={index} value={topic}>{topic}</option>
          ))}
        </select>
      </div>
      
      <div className="list-group">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <Link
              key={template.id}
              to={`/templates/${template.id}`}
              className="list-group-item list-group-item-action"
            >
              <h5>{template.title}</h5>
              <p>{template.description}</p>
              <small>Created on: {new Date(template.createdAt).toLocaleDateString()}</small>
            </Link>
          ))
        ) : (
          <p>No templates found.</p>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
