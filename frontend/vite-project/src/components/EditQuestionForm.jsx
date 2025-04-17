// components/EditQuestionForm.jsx
import React from 'react';

const EditQuestionForm = ({ darkToggle, editedQuestion, setEditedQuestion, onCancel, onSubmit }) => {
  return (
    <div className={darkToggle ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800" : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
      <h1 className='font-semibold text-lg'>Edit Question section</h1>
      <form onSubmit={onSubmit}>
        <div className="">
          <label className='text-sm'>Question Text:</label>
          <input
            type="text"
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            value={editedQuestion.text}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })}
          />
        </div>
        <div className='flex mt-2'>
          <button type="submit" className="bg-green-600 font-semibold text-white py-2 px-4 rounded-md">Update Question</button>
          <button type="button" className="bg-red-500 font-semibold text-white py-2 px-4 rounded-md ml-2" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditQuestionForm;
