import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import TemplateActions from '../components/templateDetail/TemplateActions';
import TemplateHeader from '../components/templateDetail/TemplateHeader';
import CommentSection from '../components/templateDetail/CommentSection';
import AccessManager from '../components/templateDetail/AccessManager';
import FormSubmission from '../components/templateDetail/FormSubmission';
import AddQuestionsForm from '../components/templateDetail/AddQuestionsForm'

const TemplateDetailPage = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isEditing, setIsEditing] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { user, darkToggle } = useAuth();

  const isAuthor = user && template && user.id === template.authorId;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/templates/${id}/full`);
        setTemplate(response.data);
        setLikesCount(response.data.likes?.length || 0);
        setHasLiked(response.data.likes?.some((like) => like.userId === user?.id));
        setComments(response.data.comments || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching template:', error);
        setError('There was an error fetching the template.');
      }
    };
    fetchTemplate();
  }, [id, user?.id]);

  const handleLikeToggle = async () => {
    try {
      if (hasLiked) {
        // If already liked, send DELETE
        await axios.delete(`http://localhost:5000/auth/templates/${id}/like`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setHasLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // If not liked yet, send POST
        await axios.post(
          `http://localhost:5000/auth/templates/${id}/like`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error.response?.data || error.message);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedAnswers = Object.entries(answers).map(([questionId, response]) => ({
      questionId: parseInt(questionId),
      response,
    }));

    if (formattedAnswers.length === 0) {
      alert('You must answer at least one question before submitting.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/auth/forms/submit`,
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
      setAnswers({});
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.status === 400) {
        alert(error.response.data?.message || 'Form submission was invalid.');
      } else if (error.response?.status === 401) {
        alert('You must be logged in to submit the form.');
      } else {
        alert('An unexpected error occurred.');
      }
    }

  };


  const handleDeleteAnswer = async (answerId) => {
    if (!answerId) return;

    try {
      await axios.delete(`http://localhost:5000/auth/forms/answers/${answerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Clean up local state if needed
      setAnswers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key] === answerId) delete updated[key];
        });
        return updated;
      });
    } catch (error) {
      console.error('Error deleting answer:', error);
      alert('Failed to delete your answer.');
    }
  };



  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/auth/templates/${id}/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

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
    setIsEditing(question.id);
    setEditedQuestion({ ...question });
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



  const toggleTemplateVisibility = async () => {
    try {
      await axios.put(`http://localhost:5000/auth/templates/${id}/visibility`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setTemplate((prev) => ({
        ...prev,
        isPublic: !prev.isPublic,
      }));

      alert(`Template is now ${!template.isPublic ? 'Public' : 'Private'}`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Something went wrong while changing visibility.');
    }
  };



  const handleAnswerUpdate = (answerId, questionId, newResponse) => {
    // Only update the template's answers array (for displayed answers)
    setTemplate(prevTemplate => ({
      ...prevTemplate,
      questions: prevTemplate.questions.map(question => ({
        ...question,
        answers: question.answers?.map(ans => 
          ans.id === answerId ? { ...ans, response: newResponse } : ans
        )
      }))
    }));
    
    // DON'T update the answers state for the input field
    // This prevents the input field from being populated with the edited answer
  };


  if (!template) return <div>Loading template...</div>;

  return (
    <div className={darkToggle ? "mt-2 p-4 pt-20 bg-gray-500 text-white" : "mt-2 p-4 pt-20"}>
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      <TemplateHeader title={template.title} description={template.description}
        image={template.image} likes={likesCount} hasLiked={hasLiked} onLike={handleLikeToggle} />

      <FormSubmission
        questions={template.questions} answers={answers} setAnswers={setAnswers} handleAnswerUpdate={handleAnswerUpdate}
        handleSubmit={handleSubmit}
        handleUpdateQuestion={handleUpdateQuestion} handleEditQuestion={handleEditQuestion} handleDeleteQuestion={handleDeleteQuestion}
        handleDeleteAnswer={handleDeleteAnswer}
        isEditing={isEditing} editedQuestion={editedQuestion} setEditedQuestion={setEditedQuestion}
        setIsEditing={setIsEditing}
        user={user} isAuthor={isAuthor} isAdmin={isAdmin} darkToggle={darkToggle} />


      <CommentSection comments={comments} setComments={setComments} user={user} templateId={id} />

      {(isAuthor || isAdmin) && (
        <>
          {isAuthor && (
            <AccessManager template={template} setTemplate={setTemplate} templateId={id} />
          )}

          <TemplateActions isPublic={template.isPublic} toggleVisibility={toggleTemplateVisibility} templateId={id} />
          <AddQuestionsForm templateId={id} />
        </>
      )}
    </div>
  );
};

export default TemplateDetailPage;
