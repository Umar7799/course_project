import React from 'react';

const TemplateHeader = ({ title, description, image, likes, hasLiked, onLike }) => {

  return (
    <div className='text-xl font-semibold mb-4'>
      <h2>{title}</h2>
      <p className='text-lg'>{description}</p>
      {image && (
        <img
          className="w-fit max-w-xs my-2"
          src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
          alt={title}
        />
      )}
      {/* {image && <img className='w-fit max-w-xs my-2' src={image} alt={title} />} */}
      <div className='mt-2 flex items-center space-x-4'>
        <button className={`px-3 py-1 rounded-md text-white ${hasLiked ? 'bg-red-500' : 'bg-gray-700'}`} onClick={onLike}>
          {hasLiked ? 'Unlike' : 'Like'}
        </button>
        <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
      </div>
    </div>
  );
};

export default TemplateHeader;