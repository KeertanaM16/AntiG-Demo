import React, { useState, useEffect } from 'react';
import { issuesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const IssueListWithAuth = ({ refresh, onRefreshComplete }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [message, setMessage] = useState(null);
    const { user, isAdmin } = useAuth();

    const fetchIssues = async () => {
        try {
            const data = await issuesAPI.getAll();
            setIssues(data);
        } catch (error) {
            console.error('Error fetching issues:', error);
            setMessage({ type: 'error', text: 'Failed to load issues' });
        } finally {
            setLoading(false);
            if (onRefreshComplete) onRefreshComplete();
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [refresh]);

    const handleEdit = (issue) => {
        setEditingId(issue.id);
        setEditText(issue.issue_text);
        setMessage(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setMessage(null);
    };

    const handleSaveEdit = async (id) => {
        if (!editText.trim()) {
            setMessage({ type: 'error', text: 'Issue cannot be empty' });
            return;
        }

        try {
            await issuesAPI.update(id, editText);
            setMessage({ type: 'success', text: 'Issue updated successfully!' });
            setEditingId(null);
            setEditText('');
            fetchIssues();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update issue' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this issue?')) {
            return;
        }

        try {
            await issuesAPI.delete(id);
            setMessage({ type: 'success', text: 'Issue deleted successfully!' });
            fetchIssues();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete issue' });
        }
    };

    const canEdit = (issue) => {
        return user && (user.id === issue.user_id || isAdmin);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-8">
                <div className="animate-pulse text-gray-500">Loading issues...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Issues</h2>

            {message && (
                <div className={`mb-4 text-sm p-3 rounded-md ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {issues.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
                    No issues found. Be the first to report one!
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <div
                            key={issue.id}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    {editingId === issue.id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                rows="3"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(issue.id)}
                                                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-4 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-gray-800 mb-2">{issue.issue_text}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>
                                                    By: {issue.user_name || issue.user_email || 'Anonymous'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {new Date(issue.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {isAdmin && issue.user_id !== user?.id && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-purple-600 font-medium">Admin View</span>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {canEdit(issue) && editingId !== issue.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(issue)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors"
                                            title="Edit issue"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(issue.id)}
                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium transition-colors"
                                            title="Delete issue"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IssueListWithAuth;
