// src/hooks/useTemplateDetail.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useTemplateDetail(id, user) {
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/templates/${id}/full`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        const fetchedTemplate = response.data;

        // Ensure 'questions' is always an array
        if (!Array.isArray(fetchedTemplate.questions)) {
          console.error('Questions field is not an array:', fetchedTemplate.questions);
          fetchedTemplate.questions = [];
        }

        // Validate other fields (likes, comments)
        if (!Array.isArray(fetchedTemplate.likes)) {
          fetchedTemplate.likes = [];
        }

        if (!Array.isArray(fetchedTemplate.comments)) {
          fetchedTemplate.comments = [];
        }

        // Set template data into state
        setTemplate(fetchedTemplate);
        setLikesCount(fetchedTemplate.likes.length);
        setHasLiked(fetchedTemplate.likes.some(like => like.userId === user?.id));
        setComments(fetchedTemplate.comments);
        setError(null);
      } catch (error) {
        console.error('Error fetching template:', error);
        setError('There was an error fetching the template.');
      }
    };

    fetchTemplate();
  }, [id, user?.id]);

  const handleLikeToggle = async () => {
    try {
      if (hasLiked) {
        await axios.delete(`http://localhost:5000/auth/templates/${id}/like`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await axios.post(`http://localhost:5000/auth/templates/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error.response?.data || error.message);
    }
  };

  const toggleTemplateVisibility = async () => {
    try {
      await axios.put(`http://localhost:5000/auth/templates/${id}/visibility`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

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



  return {
    template,
    setTemplate,
    error,
    hasLiked,
    likesCount,
    handleLikeToggle,
    toggleTemplateVisibility,
    comments,
    setComments
  };
}
