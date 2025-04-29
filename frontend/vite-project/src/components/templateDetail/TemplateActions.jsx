import React from 'react';
import axios from 'axios';

const TemplateActions = ({ isPublic, toggleVisibility, templateId, darkToggle }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const handleDeleteTemplate = async () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await axios.delete(`${API_URL}/auth/templates/${templateId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert("Template deleted successfully!");
        window.location.href = '/';
      } catch (error) {
        console.error("Error deleting template:", error);
        alert("There was an error deleting the template.");
      }
    }
  };

  return (
    <div className={darkToggle
      ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800"
      : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
      <h1 className="font-semibold mb-2">Only author or admin can have these buttons</h1>
      <div className='flex space-x-2'>
        <button onClick={toggleVisibility}
          className={`font-semibold px-4 py-2 rounded-md transition text-white ${isPublic ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          Make {isPublic ? 'Private' : 'Public'}
        </button>
        <button className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition" onClick={handleDeleteTemplate}>Delete Template</button>
      </div>
    </div>
  );
};

export default TemplateActions;
