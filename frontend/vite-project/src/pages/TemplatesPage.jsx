import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';


const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state
  const [selectedTopic, setSelectedTopic] = useState(''); // Track selected topic
  const [topics, setTopics] = useState([]); // Store the available topics

  const { darkToggle } = useAuth();


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
        // Decode user ID and role from token
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userRole = decodedToken.role;
        const userId = decodedToken.id;

        // Get unique topics
        const topicsSet = new Set(response.data.map(template => template.topic));
        setTopics([...topicsSet]);

        // Filter templates based on ownership, role, and selected topic
        const filteredTemplates = response.data.filter(template => {
          const topicMatch = selectedTopic ? template.topic === selectedTopic : true;

          // Show if admin, or if public, or if it's user's own template
          const canView =
            userRole === 'ADMIN' ||
            template.isPublic === true ||
            template.authorId === userId;

          return canView && topicMatch;
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
    <div className={darkToggle ? "p-4 bg-gray-400 pt-20" : "p-4 pt-20"}>
      <h2 className='text-xl font-semibold'>Templates</h2>

      {/* Topic Filter */}
      <div className="my-3">
        <label htmlFor="topicSelect" className="pl-1 text-sm font-semibold">Filter by Topic</label>
        <select
          id="topicSelect"
          className={"bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"}
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">All Topics</option>
          {topics.map((topic, index) => (
            <option key={index} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <Link
              key={template.id}
              to={`/templates/${template.id}`}
              className=""
            >
              <div className={darkToggle ? 'shadow-lg text-white bg-gray-800 p-4 rounded-lg font-semibold' : 'border border-gray-800 shadow-lg p-4 rounded-lg font-semibold'}>
                <h1 className='text-lg'>{template.title}</h1>
                <p>{template.description}</p>
                <small>Created on: {new Date(template.createdAt).toLocaleDateString()}</small>
              </div>

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
