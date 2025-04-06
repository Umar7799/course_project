// src/pages/TemplatesPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);

  // Fetch templates from the backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/templates');
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);




  return (
    <div className="container">
      <h2>Templates</h2>
      <div className="list-group">
        {Array.isArray(templates) ? (
          templates.map(template => (
            <Link key={template.id} to={`/templates/${template.id}`} className="list-group-item list-group-item-action">
              {template.title}
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
