// src/pages/TemplateDetailPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TemplateDetailPage = () => {
  const { id } = useParams(); // Get the template ID from the URL
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({}); // Store answers as an object

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/templates/${id}/full`);
        setTemplate(response.data);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Transform answers into backend-friendly format
      const formattedAnswers = Object.entries(answers).map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        response,
      }));

      await axios.post(
        'http://localhost:5000/auth/forms/submit',
        {
          templateId: parseInt(id),
          answers: formattedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Form submitted successfully!');
      setAnswers({}); // Clear answers after submission
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };


  if (!template) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{template.title}</h2>
      <p>{template.description}</p>

      <form onSubmit={handleSubmit}>
        {Array.isArray(template.questions) && template.questions.length > 0 ? (
          template.questions.map((question) => (
            <div key={question.id} className="form-group mb-3">
              <label>{question.text}</label>
              <input
                type="text"
                className="form-control"
                value={answers[question.id] || ''}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
              />
            </div>
          ))
        ) : (
          <div>No questions available for this template.</div>
        )}
        <button type="submit" className="btn btn-primary mt-2">Submit</button>
      </form>
    </div>
  );
};

export default TemplateDetailPage;
