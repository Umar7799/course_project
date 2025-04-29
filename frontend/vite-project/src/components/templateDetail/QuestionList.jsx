import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function QuestionList({ questions, setQuestions }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedQuestions = Array.from(questions);
    const [movedItem] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, movedItem);

    setQuestions(reorderedQuestions);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {questions.map((question, index) => (
              <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      padding: '10px',
                      margin: '8px 0',
                      background: '#f8f8f8',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                    }}
                  >
                    {question.text}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default QuestionList;
