import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const TemplateResultPage = () => {
  const { id: templateId } = useParams();
  const [data, setData] = useState({
    template: null,
    forms: [],
    userHasLiked: false,
    likeCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [newComment, setNewComment] = useState('');

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/auth/templates/${templateId}/forms`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async () => {
    try {
      await axios.post(`http://localhost:5000/auth/templates/${templateId}/comments`, {
        text: newComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchData(); // refresh after posting comment
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleLikeToggle = async () => {
    try {
      const method = data.userHasLiked ? 'delete' : 'post';
      await axios[method](`http://localhost:5000/auth/templates/${templateId}/likes`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchData(); // refresh after toggling like
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update like');
    }
  };

  const toggleExpand = (formId) => {
    setExpandedFormId(expandedFormId === formId ? null : formId);
  };

  const formsWithAnswers = data.forms.filter(form => form.answers?.length > 0);
  const emptyFormsCount = data.forms.length - formsWithAnswers.length;

  if (loading) return <div className="text-center py-10 text-gray-500">Loading results...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📝 {data.template?.title || 'Template Results'}</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${data.userHasLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}
          >
            ❤️ {data.likeCount}
          </button>
          <Link
            to={`/templates/${templateId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Template
          </Link>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing results for template ID: {templateId}
          {emptyFormsCount > 0 && (
            <span className="ml-2 text-orange-500">
              ({emptyFormsCount} incomplete submission{emptyFormsCount !== 1 ? 's' : ''} hidden)
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Current time: {formatDateTime(new Date().toISOString()).date} at {formatDateTime(new Date().toISOString()).time}
        </div>
      </div>

      {formsWithAnswers.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No completed submissions found
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Filled By</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formsWithAnswers.map((form) => {
                const { date, time } = formatDateTime(form.submittedAt || form.createdAt);
                return (
                  <React.Fragment key={form.id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center">
                          {form.user?.name || form.user?.email || 'Anonymous'}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">{date}</td>
                      <td className="py-3 px-4 border-b">{time}</td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={() => toggleExpand(form.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition"
                        >
                          {expandedFormId === form.id ? 'Hide Details' : 'View Answers'}
                        </button>
                      </td>
                    </tr>

                    {expandedFormId === form.id && (
                      <tr>
                        <td colSpan="4" className="py-4 px-6 bg-gray-50 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.answers.map((answer) => {
                              const answerDate = formatDateTime(answer.createdAt || form.createdAt);
                              return (
                                <div
                                  key={answer.id}
                                  className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
                                >
                                  <h4 className="font-semibold text-gray-700 mb-2">
                                    {answer.question?.text || 'Question not available'}
                                  </h4>
                                  <p className="text-gray-600">
                                    {answer.response || 'No response'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Answered on: {answerDate.date} at {answerDate.time}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t pt-8 mt-12">
        <h2 className="text-2xl font-semibold mb-4">Comments ({data.template?.comments?.length || 0})</h2>

        <div className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border rounded-lg"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
          >
            Post Comment
          </button>
        </div>

        <div className="space-y-4">
          {data.template?.comments?.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <span className="font-medium">{comment.user?.name || 'Anonymous'}</span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(comment.createdAt).date}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateResultPage;
