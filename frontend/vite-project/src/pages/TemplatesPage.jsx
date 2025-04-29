import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const { darkToggle, user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const isAuthenticated = !!token;

      try {
        const endpoint = isAuthenticated
          ? `${API_URL}/auth/templates`
          : `${API_URL}/auth/public/templates`;

        const config = isAuthenticated
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(endpoint, {
          ...config,
          params: selectedTopic ? { topic: selectedTopic } : {},
        });

        const templatesData = response.data;

        const uniqueTopics = [...new Set(templatesData.map(t => t.topic).filter(Boolean))];
        setTopics(uniqueTopics);

        if (isAuthenticated) {
          const verifiedTemplates = templatesData.filter(template => 
            template.isPublic || 
            template.author?.id === user?.id ||
            template.allowedUsers?.some(u => u.id === user?.id)
          );
          setTemplates(verifiedTemplates);
          setFilteredTemplates(verifiedTemplates);
        } else {
          setTemplates(templatesData);
          setFilteredTemplates(templatesData);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Error loading templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedTopic, user?.id, API_URL]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm === '') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template => 
        template.title.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.topic?.toLowerCase().includes(searchTerm)
      ));
    }
  };

  if (loading) return (
    <div className={darkToggle ? "p-4 bg-gray-800 text-white pt-20" : "p-4 pt-20"}>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className={darkToggle ? "p-4 bg-gray-800 text-white pt-20" : "p-4 pt-20"}>
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={darkToggle ? "p-4 bg-gray-800 text-white pt-20" : "p-4 pt-20"}>
      <h2 className='text-2xl font-bold mb-6'>Templates</h2>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">Search Templates</label>
          <input
            type="text"
            id="search"
            placeholder="Search by title, description or topic..."
            className="w-full p-2 border rounded-lg"
            onChange={handleSearch}
          />
        </div>

        <div>
          <label htmlFor="topicSelect" className="block text-sm font-medium mb-1">Filter by Topic</label>
          <select
            className="w-full p-2 border rounded-lg bg-white"
            id="topicSelect"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map((topic, idx) => (
              <option key={idx} value={topic}>{topic || 'Untagged'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <Link 
              key={template.id} 
              to={`/templates/${template.id}`}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className={`h-full rounded-lg overflow-hidden shadow-md ${
                darkToggle 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                  <p className="text-sm mb-3">{template.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded ${
                      darkToggle ? 'bg-gray-600' : 'bg-gray-100'
                    }`}>
                      {template.topic || 'General'}
                    </span>
                    <span>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!template.isPublic && (
                    <div className="mt-2 text-xs">
                      <span className="text-yellow-500">Private</span>
                      {template.allowedUsers?.length > 0 && (
                        <span className="ml-2 text-gray-400">
                          Shared with {template.allowedUsers.length} user(s)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-lg">No templates found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
