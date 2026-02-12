import React, { useState } from 'react';
import axios from 'axios';

const IssueForm = ({ onIssueAdded }) => {
    const [issue, setIssue] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedIssue = issue.trim();

        if (!trimmedIssue) {
            setMessage({ type: 'error', text: 'Issue cannot be empty.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await axios.post('http://localhost:5000/api/issues', { issue_text: trimmedIssue });
            setMessage({ type: 'success', text: 'Issue submitted successfully!' });
            setIssue('');
            if (onIssueAdded) onIssueAdded();
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to submit issue. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Log New Issue</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Issue / Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="issue"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="Type your issue here..."
                        value={issue}
                        onChange={(e) => {
                            setIssue(e.target.value);
                            if (message?.type === 'error') setMessage(null);
                        }}
                        required
                    />
                </div>

                {message && (
                    <div className={`text-sm p-3 rounded-md ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!issue.trim() || loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
            ${!issue.trim() || loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                        }`}
                >
                    {loading ? 'Submitting...' : 'Submit Issue'}
                </button>
            </form>
        </div>
    );
};

export default IssueForm;
