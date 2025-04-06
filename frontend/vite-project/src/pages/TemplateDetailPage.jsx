import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const TemplateDetailPage = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`/api/templates/${id}/full`);
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
      await axios.post('/api/forms/submit', {
        templateId: id,
        answers,
      });
      alert('Form submitted!');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!template) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="container">
      <h2>{template.title}</h2>
      <p>{template.description}</p>

      <form onSubmit={handleSubmit}>
        {template.questions.map((question) => (
          <div key={question.id} className="form-group">
            <label>{question.text}</label>
            <input
              type="text"
              className="form-control"
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[question.id] = e.target.value;
                setAnswers(newAnswers);
              }}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default TemplateDetailPage;
