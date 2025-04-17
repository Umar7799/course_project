// components/TemplateHeader.jsx
import React from 'react';

const TemplateHeader = ({ title, description }) => {
  return (
    <div className='text-xl font-semibold'>
      <h2>{title}</h2>
      <p className='text-lg'>{description}</p>
    </div>
  );
};

export default TemplateHeader;
