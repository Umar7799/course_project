import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

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
  const [allowedUsers, setAllowedUsers] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('topic', topic);
    formData.append('tags', tags);
    formData.append('isPublic', publicStatus);

    if (!publicStatus && allowedUsers.trim()) {
      allowedUsers
        .split(',')
        .map(email => email.trim())
        .filter(Boolean)
        .forEach((email, index) => formData.append(`allowedUsers[${index}]`, email));
    }

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => formData.append(`images`, file)); // backend should accept 'images' array
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

  return (
    <div className={darkToggle ? 'pt-20 bg-gray-500 text-white p-4' : 'pt-20 p-4'}>
      <h2 className='text-xl font-semibold'>Create New Template</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500">{error}</p>}

        {/* Title, Description, Topic, Tags */}
        <div className='mt-4'>
          <label className="pl-1 font-semibold">Title</label>
          <input className="input-style" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className='mt-4'>
          <label className="pl-1 font-semibold">Description</label>
          <textarea className="input-style" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className='mt-4'>
          <label className="pl-1 font-semibold">Topic</label>
          <input className="input-style" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className='mt-4'>
          <label className="pl-1 font-semibold">Tags</label>
          <input className="input-style" type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>

        {/* Image URL (optional) */}
        <div className='mt-4'>
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
            placeholder="Paste image URL"
          />
        </div>

        {/* Drag & Drop Upload */}
        <div className="mt-4">
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

        {/* Previews */}
        {(image || imageFiles.length > 0) && (
          <div className="mt-4">
            <label className="pl-1 font-semibold">Preview</label>
            <div className="flex gap-4 flex-wrap">
              {image && (
                <div>
                  <p className="text-sm text-gray-700 mb-1">From URL</p>
                  <img src={image} alt="From URL" className="w-40 h-auto rounded-md border" />
                </div>
              )}
              {imageFiles.map((file, idx) => (
                <div key={idx}>
                  <p className="text-sm text-gray-700 mb-1">Upload {idx + 1}</p>
                  <img src={URL.createObjectURL(file)} alt={`Upload ${idx + 1}`} className="w-40 h-auto rounded-md border" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public + Allowed Users */}
        <div className='mt-4'>
          <label className='pl-1 font-semibold'>
            Public
            <input className='ml-2' type="checkbox" checked={publicStatus} onChange={() => setPublicStatus(!publicStatus)} />
          </label>
        </div>

        {!publicStatus && (
          <div className='mt-4'>
            <label className="pl-1 font-semibold">Allowed Users (Emails)</label>
            <input className="input-style" type="text" value={allowedUsers} onChange={(e) => setAllowedUsers(e.target.value)} />
          </div>
        )}

        <button className='mt-6 bg-green-600 font-semibold text-white py-2 px-4 rounded-md' type="submit">
          Create Template
        </button>
      </form>

      {/* Utility class */}
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
