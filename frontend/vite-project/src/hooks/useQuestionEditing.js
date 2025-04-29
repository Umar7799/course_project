// src/hooks/useQuestionEditing.js
import { useState } from 'react';
import axios from 'axios';

export default function useQuestionEditing({ templateId, setTemplate }) {
  const [isEditing, setIsEditing] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;


  const handleEditQuestion = (question) => {
    setIsEditing(question.id);
    setEditedQuestion({ ...question });
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/auth/templates/${templateId}/questions/${editedQuestion.id}`,
        editedQuestion,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.map((q) =>
          q.id === editedQuestion.id ? editedQuestion : q
        ),
      }));

      setIsEditing(null);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('There was an error updating the question.');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(
        `${API_URL}/auth/templates/${templateId}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.filter((q) => q.id !== questionId),
      }));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('There was an error deleting the question.');
    }
  };

  return {
    isEditing,
    setIsEditing,
    editedQuestion,
    setEditedQuestion,
    handleEditQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
  };
}
