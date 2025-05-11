import React from 'react';


const TemplateHeader = ({ title, description, images, likes, hasLiked, onLike }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className='text-xl font-semibold mb-4'>
      <h2>{title}</h2>
      <p className='text-lg'>{description}</p>
      <div className='mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {images.map((image, index) => (
          <img
            key={index}
            className="w-fit max-w-xs my-2 shadow-lg"
            src={image.startsWith('http') ? image : `${API_URL}${image}`}
            alt={title}
          />
        ))}
      </div>
      {/* {image && <img className='w-fit max-w-xs my-2' src={image} alt={title} />} */}
      <div className='mt-4 flex items-center space-x-4'>
        <button className={`px-3 py-1 rounded-md text-white ${hasLiked ? 'bg-red-500' : 'bg-gray-700'}`} onClick={onLike}>
          {hasLiked ? 'Unlike' : 'Like'}
        </button>
        <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
      </div>
    </div>
  );
};

export default TemplateHeader;