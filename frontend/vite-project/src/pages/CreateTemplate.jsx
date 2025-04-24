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
  const [imageFile, setImageFile] = useState(null);
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

    // Only one of image or imageFile will be active
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (image) {
      // You could optionally append a URL as text if backend supports it
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:5000/auth/createTemplate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData, // Do not use JSON.stringify!
      });

      if (!response.ok) throw new Error('Failed to create template');

      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      setError('Only admins can create a template');
    }
  };



  return (
    <div className={darkToggle ? 'pt-20 bg-gray-500 text-white p-4' : 'pt-20 p-4'}>
      <h2 className='text-xl font-semibold'>Create New Template</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500">{error}</p>}

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Title</label>
          <input className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Description</label>
          <textarea className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Topic</label>
          <input className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic" />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Tags</label>
          <input className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Enter tags" />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Image URL (optional)</label>

          <input
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            type="text"
            value={image}
            onChange={(e) => {
              setImage(e.target.value);
              if (e.target.value) setImageFile(null); // clear file if URL entered
            }}
            placeholder="Paste image URL"
            disabled={!!imageFile}
          />
        </div>

        {/* Upload Image Section with Drag & Drop */}
        <div className="mt-4">
          <label className="block pl-1 font-semibold mb-2">Upload Image</label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                setImageFile(file);
                setImage('');
              }
            }}
            className="w-full p-6 border-2 border-dashed rounded-lg border-gray-400 text-center bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <p className="text-sm text-gray-600 mb-2">Drag & drop your image here</p>
            <p className="text-sm text-gray-600 mb-2">or</p>

            <label className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-md">
              Choose from device
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  if (e.target.files.length > 0) setImage('');
                }}
                disabled={!!image}
                className="hidden"
              />
            </label>
          </div>
        </div>



        {/* Image Preview Section */}
        {(image || imageFile) && (
          <div className="mt-4">
            <label className="pl-1 font-semibold">Preview</label>
            <div className="flex gap-4 flex-wrap">
              {/* Display the image from URL if available */}
              {image && (
                <div>
                  <p className="text-sm text-gray-700 mb-1">From URL</p>
                  <img
                    src={image}
                    alt="From URL"
                    className="w-40 h-auto rounded-md border"
                    onError={(e) => {
                      // Fallback in case image URL fails to load
                      e.target.style.display = 'none';
                      // Optionally, you can also display a fallback image or message
                    }}
                  />
                </div>
              )}

              {/* Display the image preview for the uploaded file */}
              {imageFile && (
                <div>
                  <p className="text-sm text-gray-700 mb-1">From Upload</p>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Uploaded"
                    className="w-40 h-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
        )}





        <div className='mt-4'>
          <label className='pl-1 font-semibold'>
            Public
            <input className='ml-2'
              type="checkbox" checked={publicStatus} onChange={() => setPublicStatus(!publicStatus)} />
          </label>
        </div>

        {!publicStatus && (
          <div className='mt-4'>
            <label className="pl-1 font-semibold">Allowed Users (Emails)</label>
            <input className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
              type="text" value={allowedUsers} onChange={(e) => setAllowedUsers(e.target.value)} placeholder="Comma-separated emails" />
          </div>
        )}

        <button className='mt-6 bg-green-600 font-semibold text-white py-2 px-4 rounded-md' type="submit">Create Template</button>
      </form>
    </div>
  );
};

export default CreateTemplatePage;
