import React from 'react';
import axios from 'axios';
import QuestionItem from './QuestionItem';

const FormSubmission = ({
  questions,
  answers,
  setAnswers,
  handleSubmit,
  handleEditQuestion,
  handleDeleteQuestion,
  handleDeleteAnswer,
  isEditing,
  editedQuestion,
  setEditedQuestion,
  handleUpdateQuestion,
  handleAnswerUpdate,
  setIsEditing,
  user,
  isAuthor,
  isAdmin,
  darkToggle,
}) => {
  const handleUpdateAnswer = async (answerId, newResponse, questionId) => {
    // Skip API call if it's a temporary answer
    if (answerId.startsWith('temp-')) {
      console.warn('Skipping update for temporary answer:', answerId);
      // Just update local state instead
      handleAnswerUpdate(answerId, questionId, newResponse);
      return true;
    }

    try {
      await axios.put(
        `http://localhost:5000/auth/forms/answers/${answerId}`,
        { response: newResponse },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      handleAnswerUpdate(answerId, questionId, newResponse);
      return true;
    } catch (err) {
      console.error('Error updating answer:', err);
      alert('Failed to update answer.');
      return false;
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      {Array.isArray(questions) && questions.length > 0 ? (
        questions.map((question) => (
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
            onUpdateAnswer={(answerId, newResponse) =>
              handleUpdateAnswer(answerId, newResponse, question.id)
            } // 🧠 Add questionId to avoid answer duplication
          />
        ))
      ) : (
        <div className="my-2 font-medium">No questions available for this template.</div>
      )}
      <div className={questions.length <= 0 ? 'hidden' : ''}>
        <button type="submit" className="rounded-md text-white font-semibold px-4 py-1 bg-green-600">
          Submit
        </button>
      </div>
    </form>
  );
};

export default FormSubmission;
