import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AddQuestionsForm from './AddQuestionsForm';
import QuestionItem from '../components/QuestionItem';
import TemplateHeader from '../components/TemplateHeader';
import TemplateActions from '../components/TemplateActions';

const TemplateDetailPage = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isEditing, setIsEditing] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
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
      await axios.post(
        `http://localhost:5000/auth/templates/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setHasLiked(!hasLiked);
      setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('You must be logged in to like a template.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:5000/auth/templates/${id}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setComments((prev) => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('You must be logged in to comment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        response,
      }));

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
      alert('To submit an answer you have to log in');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      await axios.delete(`http://localhost:5000/auth/forms/answers/${answerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting answer:', error);
      alert('There was an error deleting your answer.');
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

  if (!template) return <div>Loading template...</div>;

  return (
    <div className={darkToggle ? "mt-2 p-4 pt-20 bg-gray-500 text-white" : "mt-2 p-4 pt-20"}>
      {error && <div className="text-red-500 font-semibold mb-4">{error}</div>}

      <TemplateHeader
        title={template.title}
        description={template.description}
        image={template.image}
        likes={likesCount}
        hasLiked={hasLiked}
        onLike={handleLikeToggle}
      />

      <form onSubmit={handleSubmit}>
        {Array.isArray(template.questions) && template.questions.length > 0 ? (
          template.questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              answer={answers[question.id] || ''}
              setAnswers={setAnswers}
              user={user}
              isAuthor={isAuthor}
              isAdmin={isAdmin}
              darkToggle={darkToggle}
              onEdit={() => handleEditQuestion(question)}
              onDelete={() => handleDeleteQuestion(question.id)}
              onDeleteAnswer={handleDeleteAnswer}
              isEditing={isEditing}
              editedQuestion={editedQuestion}
              setEditedQuestion={setEditedQuestion}
              onSubmitEdit={handleUpdateQuestion}
              onCancelEdit={() => setIsEditing(null)}
            />
          ))
        ) : (
          <div className='my-2 font-medium'>No questions available for this template.</div>
        )}
        <div className={template.questions.length <= 0 ? 'hidden' : ''}>
          <button type="submit" className="rounded-md text-white font-semibold px-4 py-1 bg-green-600">Submit</button>
        </div>
      </form>

      <div className='mt-6'>
        <h3 className='text-lg font-semibold mb-2'>Comments</h3>
        <div className='space-y-2 mb-4'>
          {comments.length > 0 ? comments.map((comment) => (
            <div key={comment.id} className='border p-2 rounded'>
              <p className='text-sm'>{comment.content}</p>
              <span className='text-xs text-gray-500'>By User #{comment.userId}</span>
            </div>
          )) : (
            <p className='text-sm text-gray-600'>No comments yet.</p>
          )}
        </div>

        {user && (
          <div className='flex items-center space-x-2'>
            <input
              type='text'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className='border rounded px-2 py-1 flex-grow'
              placeholder='Add a comment...'
            />
            <button onClick={handleAddComment} className='bg-blue-600 text-white px-3 py-1 rounded'>
              Post
            </button>
          </div>
        )}
      </div>

      {(isAuthor || isAdmin) && (
        <>
          <TemplateActions
            isPublic={template.isPublic}
            toggleVisibility={toggleTemplateVisibility}
            templateId={id}
          />
          <AddQuestionsForm templateId={id} />
        </>
      )}
    </div>
  );
};

export default TemplateDetailPage;
