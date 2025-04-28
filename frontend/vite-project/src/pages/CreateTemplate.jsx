import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Select from 'react-select';

const CreateTemplatePage = () => {
  const { darkToggle } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [publicStatus, setPublicStatus] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState([]);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([{ text: '', description: '', type: 'SINGLE_LINE' }]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:5000/auth/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('topic', topic);
    formData.append('tags', tags);
    formData.append('isPublic', publicStatus);

    // Send questions as a JSON string
    formData.append('questions', JSON.stringify(questions));

    // ✅ Correct way: Send allowedUserEmails (not IDs) 
    if (!publicStatus && allowedUsers.length > 0) {
      formData.append('allowedUserEmails', JSON.stringify(allowedUsers));
    }

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => formData.append('images', file));
    } else if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:5000/auth/createTemplate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create template');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      setError('Only admins can create a template');
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setImageFiles(prev => [...prev, ...droppedFiles]);
    setImage('');
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...selectedFiles]);
    setImage('');
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', description: '', type: 'SINGLE_LINE' }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const questionTypes = ['SINGLE_LINE', 'MULTI_LINE', 'INTEGER', 'CHECKBOX']; // List of valid types

  const handleQuestionTypeChange = (index, selectedOption) => {
    const newType = selectedOption ? selectedOption.value : ''; // Get value from selectedOption
    setQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index].type = newType;
      return updatedQuestions;
    });
  };

  return (
    <div className={darkToggle ? 'pt-20 bg-gray-500 text-white p-4' : 'pt-20 p-4'}>
      <h2 className="text-2xl font-bold mb-6">Create New Template</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500">{error}</p>}

        <div>
          <label className="pl-1 font-semibold">Title</label>
          <input className="input-style" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="pl-1 font-semibold">Description</label>
          <textarea className="input-style" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div>
          <label className="pl-1 font-semibold">Topic</label>
          <input className="input-style" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
        </div>

        <div>
          <label className="pl-1 font-semibold">Tags (comma separated)</label>
          <input className="input-style" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="example: ai,education,fun" />
        </div>

        <div>
          <label className="pl-1 font-semibold">Image URL (optional)</label>
          <input
            className="input-style"
            type="text"
            value={image}
            onChange={(e) => {
              setImage(e.target.value);
              if (e.target.value) setImageFiles([]);
            }}
            disabled={imageFiles.length > 0}
            placeholder="Paste image URL here..."
          />
        </div>

        <div>
          <label className="block pl-1 font-semibold mb-2">Upload Images</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="w-full p-6 border-2 border-dashed rounded-lg border-gray-400 text-center bg-gray-50 hover:bg-gray-100"
          >
            <p className="text-sm text-gray-600 mb-2">Drag & drop multiple images here</p>
            <p className="text-sm text-gray-600 mb-2">or</p>
            <label className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-md">
              Choose from device
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={!!image}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Questions Section */}
        <div>
          <label className="pl-1 font-semibold">Questions</label>
          {questions.map((question, index) => (
            <div key={index} className="mb-4">
              <input
                className="input-style"
                type="text"
                placeholder="Question Text"
                value={question.text}
                onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                required
              />
              <textarea
                className="input-style"
                placeholder="Question Description"
                value={question.description}
                onChange={(e) => handleQuestionChange(index, 'description', e.target.value)}
              />
              <Select
                value={question.type ? { value: question.type, label: question.type } : null} // Updated value format
                onChange={(selectedOption) => handleQuestionTypeChange(index, selectedOption)}
                options={questionTypes.map(type => ({ value: type, label: type }))}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <button type="button" onClick={() => handleRemoveQuestion(index)} className="text-red-500">Remove</button>
            </div>
          ))}
          <button type="button" onClick={handleAddQuestion} className="text-blue-500">Add Question</button>
        </div>

        <div>
          <label className="pl-1 font-semibold">
            Public
            <input className="ml-2" type="checkbox" checked={publicStatus} onChange={() => setPublicStatus(!publicStatus)} />
          </label>
        </div>

        {!publicStatus && (
          <div>
            <label className="pl-1 font-semibold mb-1 block">Allowed Users (Select multiple)</label>
            <Select
              isMulti
              isClearable
              options={users.map((user) => ({
                value: user.email,
                label: user.email,
              }))}
              value={allowedUsers.map(email => ({ value: email, label: email }))}
              onChange={(selected) => setAllowedUsers(selected.map(opt => opt.value))}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select users allowed to access..."
            />
          </div>
        )}

        <button className="mt-6 bg-green-600 hover:bg-green-700 font-semibold text-white py-2 px-4 rounded-md transition" type="submit">
          Create Template
        </button>
      </form>

      <style>{`
.input-style {
  background-color: #f9fafb;
  display: block;
  width: 100%;
  border: 1px solid #d1d5db;
  color: #111827;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  padding: 0.625rem;
}
`}</style>
    </div>
  );
};

export default CreateTemplatePage;
