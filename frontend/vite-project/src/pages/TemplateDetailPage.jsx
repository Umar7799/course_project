import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AddQuestionsForm from './AddQuestionsForm'; // Import your existing AddQuestionForm component

const TemplateDetailPage = () => {
  const { id } = useParams(); // Get the template ID from the URL
  const [template, setTemplate] = useState(null);
  const [answers, setAnswers] = useState({}); // Store answers as an object
  const [isEditing, setIsEditing] = useState(null); // To manage editing state of a question
  const [editedQuestion, setEditedQuestion] = useState({}); // To store edited question data

  const { user, darkToggle } = useAuth(); // Access the user object from the Auth context

  // Check if the user is the template author
  const isAuthor = user && template && user.id === template.authorId;
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/templates/${id}/full`);
        setTemplate(response.data);
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Transform answers into backend-friendly format
      const formattedAnswers = Object.entries(answers).map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        response,
      }));

      await axios.post(
        'http://localhost:5000/auth/forms/submit',
        {
          templateId: parseInt(id),
          answers: formattedAnswers,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Form submitted successfully!');
      setAnswers({}); // Clear answers after submission
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form.');
    }
  };








  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/auth/templates/${id}/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Remove the deleted question from the state
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.filter((q) => q.id !== questionId),
      }));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('There was an error deleting the question.');
    }
  };

  const handleEditQuestion = (question) => {
    setIsEditing(question.id); // Start editing this question
    setEditedQuestion({ ...question }); // Pre-fill the form with current question data
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/auth/templates/${id}/questions/${editedQuestion.id}`,
        editedQuestion,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the question in the state after successful edit
      setTemplate((prevTemplate) => ({
        ...prevTemplate,
        questions: prevTemplate.questions.map((q) =>
          q.id === editedQuestion.id ? editedQuestion : q
        ),
      }));

      setIsEditing(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating question:', error);
      alert('There was an error updating the question.');
    }
  };

  if (!template) {
    return <div>Loading template...</div>;
  }


  const toggleTemplateVisibility = async () => {
    try {
      await axios.put(
        `http://localhost:5000/auth/templates/${id}/visibility`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );


      setTemplate(prev => ({
        ...prev,
        isPublic: !prev.isPublic,
      }));

      alert(`Template is now ${!template.isPublic ? 'Public' : 'Private'}`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Something went wrong while changing visibility.');
    }
  };






  return (
    <div className={darkToggle ? "mt-2 p-4 pt-20 bg-gray-500 text-white" : "mt-2 p-4 pt-20"}>
      <div className='text-xl font-semibold'>
        <h2>{template.title}</h2>
        <p className='text-lg'>{template.description}</p>
      </div>

      {/* Form for submitting answers */}
      <form onSubmit={handleSubmit}>
        {Array.isArray(template.questions) && template.questions.length > 0 ? (
          template.questions.map((question) => (
            <div key={question.id} className="mb-3 pt-4">
              <div className={darkToggle ? 'border p-4 rounded-lg border-gray-800 bg-gray-800 shadow' : 'border p-4 rounded-lg border-gray-400 bg-gray-400 shadow'}>

                <label className='font-semibold'>{question.text}</label>
                <input
                  className="bg-gray-50 my-2 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  type="text" value={answers[question.id] || ''} onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })} placeholder='Your answer' />

                <button type="submit" className="rounded-md text-white font-semibold px-4 py-1 bg-green-600">Submit</button>
              </div>

              {/* Only show the edit and delete buttons for the author or admin */}
              {(isAuthor || isAdmin) && (
                <div className={darkToggle ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800" : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
                  <h1>only admin can have these functions:</h1>
                  <div className='sm:flex space-y-2 space-x-2 sm:space-y-0 pt-1'>
                    <button type="button" className="text-white bg-yellow-500 px-4 py-1 rounded-md" onClick={() => handleEditQuestion(question)}>Edit the question</button>
                    <button type="button" className="text-white bg-red-500 px-4 py-1 rounded-md" onClick={() => handleDeleteQuestion(question.id)}>Delete the question</button>
                  </div>
                </div>
              )}
            </div>


          ))
        ) : (
          <div className='my-2'>No questions available for this template.</div>
        )}

      </form >



      {/* Toggle Public/Private Button */}


      {(isAuthor || isAdmin) && (
        <div className="mt-6">
          <button
            onClick={toggleTemplateVisibility}
            className={`font-semibold px-4 py-2 rounded-md transition text-white ${template.isPublic ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            Make {template.isPublic ? 'Private' : 'Public'}
          </button>
        </div>
      )}




      {/* Editing Form */}
      {
        isEditing && (
          <div className={darkToggle ? "mt-2 font-semibold border rounded-lg p-4 border-gray-800 shadow bg-gray-800" : "mt-2 font-semibold border rounded-lg p-4 border-gray-400 shadow bg-gray-400"}>
            <h1 className='font-semibold text-lg'>Edit Question section</h1>
            <form onSubmit={handleUpdateQuestion}>
              <div className="">
                <label className='text-sm'>Question Text:</label>
                <input type="text" className="bg-gray-50 block w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5" value={editedQuestion.text} onChange={(e) => setEditedQuestion({ ...editedQuestion, text: e.target.value })} />
              </div>
              <div className='flex mt-2'>
                <button type="submit" className="bg-green-600 font-semibold text-white py-2 px-4 rounded-md">Update Question</button>
                <button type="button" className="bg-red-500 font-semibold text-white py-2 px-4 rounded-md ml-2" onClick={() => setIsEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )
      }

      {/* Add New Question Form */}
      {
        (isAuthor || isAdmin) && (
          <AddQuestionsForm templateId={id} />
        )
      }

      {/* Delete Template Button */}
      {(isAuthor || isAdmin) && (
        <div className="mt-6">
          <button
            onClick={async () => {
              const confirmDelete = window.confirm("Are you sure you want to delete this entire template?");
              if (!confirmDelete) return;

              try {
                await axios.delete(`http://localhost:5000/auth/templates/${id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                });

                alert("Template deleted successfully!");
                window.location.href = '/'; // Redirect to homepage or templates list
              } catch (error) {
                console.error("Error deleting template:", error);
                alert("There was an error deleting the template.");
              }
            }}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Delete Template
          </button>
        </div>
      )}



    </div >
  );
};

export default TemplateDetailPage;
