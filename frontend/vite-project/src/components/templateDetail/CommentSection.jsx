import React, { useState } from 'react';

const CommentSection = ({ comments, setComments, user, templateId }) => {
    const [newComment, setNewComment] = useState('');

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`http://localhost:5000/auth/templates/${templateId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ text: newComment }),
            });
            const data = await res.json();
            setComments((prev) => [...prev, data]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('You must be logged in to comment.');
        }
    };

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            {user && (
                <div className="flex items-center space-x-2">
                    <input className="border rounded px-2 py-1 flex-grow" type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." />
                    <button onClick={handleAddComment} className="bg-blue-600 text-white px-3 py-1 rounded">Post</button>
                </div>
            )}

            <div className="space-y-2 mb-4">
                {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment.id} className="p-2">
                        <p className="font-semibold">{comment.text}</p>
                        <span className="text-xs text-gray-500">
                            By {comment.user?.name || `User #${comment.userId}`}
                        </span>
                    </div>
                )) : (
                    <p className="text-sm text-gray-600">No comments yet.</p>
                )}
            </div>

        </div>
    );
};

export default CommentSection;
