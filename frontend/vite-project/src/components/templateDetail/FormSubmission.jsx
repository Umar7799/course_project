import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import QuestionItem from './QuestionItem';

const FormSubmission = ({
  questions,
  setQuestions, // <-- you need this to update order
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setQuestions(reordered);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {Array.isArray(questions) && questions.length > 0 ? (
                questions.map((question, index) => (
                  <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <QuestionItem
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
                          onUpdateAnswer={handleAnswerUpdate}
                          showSubmit={index === 0 || index >= 0 && questions.length > 0}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <div className="my-2 font-medium">No questions available for this template.</div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </form>
  );
};

export default FormSubmission;
