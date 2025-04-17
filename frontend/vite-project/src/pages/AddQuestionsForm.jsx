import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';


const AddQuestionForm = ({ templateId }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('SINGLE_LINE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { darkToggle } = useAuth();



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text || !type) {
      setError('Both text and type are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/auth/templates/${templateId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text, type }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to add question');
        setSuccess('');
        return;
      }

      setSuccess('Question added successfully!');
      setError('');
      setText('');
      setType('SINGLE_LINE');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className={darkToggle ? 'mt-8 border border-gray-800 bg-gray-800 p-4 rounded-md' : 'mt-8 border border-gray-400 bg-gray-400 p-4 rounded-md'}>





      <h3 className='font-semibold text-lg'>Add Question to Template</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label className='font-semibold'>Question Text:</label>
          <input className='bg-gray-50 my-2 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5'
            type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter question" required />
        </div>
        <div className='font-semibold my-2'>
          <label>Type:</label><br />
          <select className='border rounded-md px-4 ml-2 mt-1 py-2' value={type} onChange={(e) => setType(e.target.value)}>
            <option className='text-black' value="SINGLE_LINE">Single Line</option>
            <option className='text-black' value="MULTI_LINE">Multi Line</option>
            <option className='text-black' value="INTEGER">Integer</option>
            <option className='text-black' value="CHECKBOX">Checkbox</option>
          </select>
          <button className='bg-green-600 font-semibold text-white mt-2 sm:mt-0 ml-2 py-2 px-4 rounded-md' type="submit">Add Question</button>
        </div>
        <div></div>
      </form>


    </div>
  );
};

export default AddQuestionForm;