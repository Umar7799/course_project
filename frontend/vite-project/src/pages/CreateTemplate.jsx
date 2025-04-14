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
  const [imageFile, setImageFile] = useState(null); // New state for file upload
  const [publicStatus, setPublicStatus] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async () => {
    if (!imageFile) return '';

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await fetch('http://localhost:5000/upload', { // Replace with your actual image upload route
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      return data.url; // Expected response: { url: 'http://example.com/your-uploaded-image.jpg' }
    } catch (err) {
      console.error('Image upload error:', err);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = image;

    if (imageFile) {
      const uploadedUrl = await handleImageUpload();
      imageUrl = uploadedUrl || image; // Fallback to text input if upload fails
    }

    const newTemplate = {
      title,
      description,
      topic,
      tags: tags.split(',').map(tag => tag.trim()),
      image: imageUrl,
      public: publicStatus,
    };

    try {
      const response = await fetch('http://localhost:5000/auth/createTemplate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newTemplate),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const result = await response.json();
      console.log(result);
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
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Title</label>
          <input
            type="text"
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Description</label>
          <textarea
            value={description}
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>


        <div className='mt-4'>
          <label className="pl-1 font-semibold">Topic</label>
          <input
            type="text"
            value={topic}
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic"
          />
        </div>

        <div className='mt-4'>
          <label className="pl-1 font-semibold">Tags</label>
          <input
            type="text"
            value={tags}
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            onChange={(e) => setTags(e.target.value)}
          />
        </div>


        <div className='mt-4'>
          <label className="pl-1 font-semibold">Image URL (optional)</label>
          <input
            type="text"
            value={image}
            className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
            onChange={(e) => setImage(e.target.value)}
            placeholder="Paste image URL"
          />
        </div>

        <div className='mt-4'>
          <label className='block pl-1 font-semibold'>Or Upload Image</label>
          <input
            type="file"
            accept="image/*"
            className='underline p-2.5'
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <div className='mt-2 pb-4'>
          <label className='pl-1 font-semibold'>
            Public
            <input
              className='ml-1'
              type="checkbox"
              checked={publicStatus}
              onChange={() => setPublicStatus(!publicStatus)}
            />
          </label>
        </div>
        <button type="submit" className='mb-4 bg-green-600 font-semibold text-white ml-2 py-2 px-4 rounded-md'>Create Template</button>
      </form>
    </div>
  );
};

export default CreateTemplatePage;
