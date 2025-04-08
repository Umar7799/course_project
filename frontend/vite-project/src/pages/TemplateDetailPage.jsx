import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // Importing the custom hook for authentication
import AddQuestionsForm from './AddQuestionsForm'; // Import your existing AddQuestionForm component

const TemplateDetailPage = () => {
  const { id } = useParams(); // Get the template ID from the URL
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({}); // Store answers as an object
  const [isEditing, setIsEditing] = useState(null); // To manage editing state of a question
  const [editedQuestion, setEditedQuestion] = useState({}); // To store edited question data

  const { user } = useAuth(); // Access the user object from the Auth context
  
  // Check if the user is the template author
  const isAuthor = user && template && user.id === template.authorId;
  const isAdmin = user && user.role === 'admin';

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

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/auth/templates/${id}/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Remove the deleted question from the state
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.filter((q) => q.id !== questionId),
      }));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('There was an error deleting the question.');
    }
  };

  const handleEditQuestion = (question) => {
    setIsEditing(question.id); // Start editing this question
    setEditedQuestion({ ...question }); // Pre-fill the form with current question data
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/auth/templates/${id}/questions/${editedQuestion.id}`,
        editedQuestion,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the question in the state after successful edit
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.map((q) =>
          q.id === editedQuestion.id ? editedQuestion : q
        ),
      }));

      setIsEditing(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating question:', error);
      alert('There was an error updating the question.');
    }
  };

  if (!template) {
    return <div>Loading template...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>{template.title}</h2>
      <p>{template.description}</p>

      {/* Form for submitting answers */}
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
              {/* Only show the edit and delete buttons for the author or admin */}
              {(isAuthor || isAdmin) && (
                <div className="mt-2">
                  <button type="button" className="btn btn-warning" onClick={() => handleEditQuestion(question)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger ml-2" onClick={() => handleDeleteQuestion(question.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No questions available for this template.</div>
        )}
        <button type="submit" className="btn btn-primary mt-2">Submit</button>
      </form>

      {/* Editing Form */}
      {isEditing && (
        <div className="mt-4">
          <h3>Edit Question</h3>
          <form onSubmit={handleUpdateQuestion}>
            <div className="form-group">
              <label>Question Text</label>
              <input
                type="text"
                className="form-control"
                value={editedQuestion.text}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Question</button>
            <button type="button" className="btn btn-secondary ml-2" onClick={() => setIsEditing(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Add New Question Form */}
      {(isAuthor || isAdmin) && (
        <AddQuestionsForm templateId={id} />
      )}
    </div>
  );
};

export default TemplateDetailPage;
