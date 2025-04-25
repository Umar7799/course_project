import React from 'react';
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
            onUpdateAnswer={handleAnswerUpdate}  // Pass down handleAnswerUpdate
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
