import React, { useState } from 'react';

const CommentSection = ({ comments, setComments, user, templateId }) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;


  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      text: newComment,
      user,
      userId: user.id,
      _isTemp: true,
    };

    // Optimistic update
    setComments(prev => [...prev, tempComment]);
    setNewComment('');

    try {
      const res = await fetch(`${API_URL}/auth/templates/${templateId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!res.ok) throw new Error('Failed to add comment');
      const data = await res.json();
      if (!data?.id) throw new Error('Invalid response from server');

      // Replace the temp comment with real one
      setComments(prev =>
        prev.map(c => (c.id === tempId ? data : c))
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('You must be logged in to comment.');

      // Remove temp comment on failure
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isTemp = String(commentId).startsWith('temp');
    if (isTemp) {
      alert("This comment isn't saved yet.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete the comment.');
    }
  };

  const handleEditComment = (comment) => {
    if (comment._isTemp) {
      alert("Can't edit an unsaved comment.");
      return;
    }
    setEditingCommentId(comment.id);
    setEditedText(comment.text);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editedText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/auth/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: editedText }),
      });

      if (!res.ok) throw new Error('Failed to update comment');
      const updated = await res.json();

      // Optimistic UI update
      setComments(prev =>
        prev.map(c => (c.id === commentId ? updated : c))
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update the comment.');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>

      {user && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            className="border rounded px-2 py-1 flex-grow"
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Post
          </button>
        </div>
      )}

      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-2 border rounded bg-white text-black">
              {editingCommentId === comment.id ? (
                <>
                  <input
                    type="text"
                    className="border px-2 py-1 w-full mb-1"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      className="bg-green-600 text-white px-2 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold">{comment.text}</p>
                  <span className="text-xs text-gray-500 block">
                    By {comment.user?.name || `User #${comment.userId}`}
                  </span>
                  {user?.id === comment.userId && (
                    <div className="mt-1 space-x-2 text-sm">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
