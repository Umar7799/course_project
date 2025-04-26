import React, { useState } from 'react';

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
  onUpdateAnswer,
  isEditing,
  editedQuestion,
  setEditedQuestion,
  onSubmitEdit,
  onCancelEdit,
  showSubmit,
}) => {
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editedAnswer, setEditedAnswer] = useState('');

  const handleChange = (e) => {
    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
  };

  const handleSaveAnswer = async (answerId) => {
    if (!editedAnswer.trim()) return;

    const success = await onUpdateAnswer(answerId, editedAnswer, question.id);

    if (success) {
      setEditingAnswerId(null);
      setEditedAnswer('');
    }
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
              className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 mt-1"
              type="text"
              value={editedQuestion.text}
              onChange={(e) =>
                setEditedQuestion({ ...editedQuestion, text: e.target.value })}
            />
            <div className='flex mt-2'>
              <button className="bg-green-600 font-semibold text-white py-1 px-4 rounded-md" type="button" onClick={onSubmitEdit}>Update</button>
              <button className="bg-red-500 font-semibold text-white py-1 px-4 rounded-md ml-2" type="button" onClick={onCancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <label className='font-semibold'>{question.text}</label>
            <input className="bg-gray-50 my-2 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              type="text" value={answer} onChange={handleChange} placeholder='Your answer' />
            {showSubmit && (
              <button className="mt-2 bg-green-600 text-white px-4 py-1 rounded-md" type="submit">Submit</button>
            )}
          </>
        )}
      </div>

      {Array.isArray(question.answers) && question.answers.map((ans) => (
        <div key={ans.id} className="mt-2 p-2 border rounded-md bg-white text-black">
          {editingAnswerId === ans.id ? (
            <div className="flex items-center space-x-2">
              <input
                className="border px-2 py-1 rounded w-full"
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handleSaveAnswer(ans.id)} type='button'
              >
                Save
              </button>
              <button type='button'
                className="text-sm text-gray-500"
                onClick={() => {
                  setEditingAnswerId(null);
                  setEditedAnswer('');
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{ans.response}</p>
                <span className="text-xs text-gray-500">— by {ans.form?.user?.name || 'Unknown'}</span>
              </div>
              {user && ans.form?.userId === user.id && (
                <div className="flex space-x-2">
                  <button className="text-xs text-blue-600 hover:underline"
                    type='button' onClick={() => { setEditingAnswerId(ans.id); setEditedAnswer(ans.response); }}>Edit</button>
                  <button className="text-xs text-red-600 hover:underline"
                    type="button" onClick={() => onDeleteAnswer(ans.id)}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {(isAuthor || isAdmin) && !isBeingEdited && (
        <div className={darkToggle
          ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800"
          : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
          <h1>only admin or author can have these functions:</h1>
          <div className='sm:flex space-y-2 space-x-2 sm:space-y-0 pt-1'>
            <button
              type="button"
              className="text-white bg-yellow-500 px-4 py-1 rounded-md"
              onClick={onEdit}
            >
              Edit the question
            </button>
            <button
              type="button"
              className="text-white bg-red-500 px-4 py-1 rounded-md"
              onClick={onDelete}
            >
              Delete the question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
