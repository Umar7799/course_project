import React from 'react';

const QuestionItem = ({
  question,
  answer,
  setAnswers,
  user,
  isAuthor,
  isAdmin,
  darkToggle,
  onEdit,
  onDelete,
  onDeleteAnswer,
  isEditing,
  editedQuestion,
  setEditedQuestion,
  onSubmitEdit,
  onCancelEdit
}) => {
  const handleChange = (e) => {
    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
  };

  const isBeingEdited = isEditing === question.id;

  return (
    <div className="mb-3 pt-4">
      <div className={darkToggle
        ? 'border p-4 rounded-lg border-gray-800 bg-gray-800 shadow'
        : 'border p-4 rounded-lg border-gray-400 bg-gray-400 shadow'}>

        {isBeingEdited ? (
          <div>
            <label className='text-sm font-semibold'>Edit Question Text:</label>
            <input
              type="text"
              className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 mt-1"
              value={editedQuestion.text}
              onChange={(e) =>
                setEditedQuestion({ ...editedQuestion, text: e.target.value })
              }
            />
            <div className='flex mt-2'>
              <button
                type="button"
                className="bg-green-600 font-semibold text-white py-1 px-4 rounded-md"
                onClick={onSubmitEdit}
              >
                Update
              </button>
              <button
                type="button"
                className="bg-red-500 font-semibold text-white py-1 px-4 rounded-md ml-2"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <label className='font-semibold'>{question.text}</label>
            <input
              className="bg-gray-50 my-2 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              type="text"
              value={answer}
              onChange={handleChange}
              placeholder='Your answer'
            />
          </>
        )}
      </div>

      {Array.isArray(question.answers) && question.answers.map((ans) => (
        <div key={ans.id} className="mt-2 p-2 border rounded-md bg-white text-black flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{ans.response}</p>
            <span className="text-xs text-gray-500">— by {ans.form?.user?.name || 'Unknown'}</span>
          </div>
          {user && ans.form?.userId === user.id && (
            <button
            type='button'
              onClick={() => onDeleteAnswer(ans.id)}
              className="ml-4 text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      {(isAuthor || isAdmin) && !isBeingEdited && (
        <div className={darkToggle
          ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800"
          : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
          <h1>only admin or author can have these functions:</h1>
          <div className='sm:flex space-y-2 space-x-2 sm:space-y-0 pt-1'>
            <button type="button" className="text-white bg-yellow-500 px-4 py-1 rounded-md" onClick={onEdit}>
              Edit the question
            </button>
            <button type="button" className="text-white bg-red-500 px-4 py-1 rounded-md" onClick={onDelete}>
              Delete the question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
