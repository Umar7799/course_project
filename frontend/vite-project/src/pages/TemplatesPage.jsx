import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const { darkToggle } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const isAuthenticated = !!token;

      try {
        const endpoint = isAuthenticated
          ? 'http://localhost:5000/auth/templates'
          : 'http://localhost:5000/auth/public/templates';

        const config = isAuthenticated
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(endpoint, {
          ...config,
          params: selectedTopic ? { topic: selectedTopic } : {},
        });

        const templatesData = response.data;

        // Extract unique topics
        const uniqueTopics = [...new Set(templatesData.map(t => t.topic))];
        setTopics(uniqueTopics);

        setTemplates(templatesData);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Error loading templates.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedTopic]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className={darkToggle ? "p-4 bg-gray-400 pt-20" : "p-4 pt-20"}>
      <h2 className='text-xl font-semibold'>Templates</h2>

      {/* Topic Filter */}
      <div className="my-3">
        <label htmlFor="topicSelect" className="pl-1 text-sm font-semibold">Filter by Topic</label>
        <select className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          id="topicSelect" value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
          <option value="">All Topics</option>
          {topics.map((topic, idx) => (
            <option key={idx} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {templates.length > 0 ? (
          templates.map(template => (
            <Link key={template.id} to={`/templates/${template.id}`}>
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
