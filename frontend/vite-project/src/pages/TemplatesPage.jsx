import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  // Fetch templates from the backend
  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem('token');  // Retrieve the token from localStorage
      console.log('Sending token:', token);  // Log token for debugging

      try {
        const response = await axios.get('http://localhost:5000/auth/templates', {
          headers: {
            Authorization: `Bearer ${token}`  // Send token in Authorization header
          }
        });

        // Log the response for debugging
        console.log('Response data:', response.data);

        // Get the user role from the token (you can decode the JWT here or store it)
        const userRole = JSON.parse(atob(token.split('.')[1])).role; // Assuming role is part of the token

        // Filter templates based on the role and visibility
        const filteredTemplates = response.data.filter(template => {
          if (userRole === 'ADMIN') {
            return true;  // Admin can see all templates
          }
          return template.isPublic;  // Regular users only see public templates
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
  }, []);

  if (loading) {
    return <div>Loading templates...</div>; // Show loading message while fetching data
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>; // Show error message
  }

  return (
    <div className="container mt-5">
      <h2>Templates</h2>
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
