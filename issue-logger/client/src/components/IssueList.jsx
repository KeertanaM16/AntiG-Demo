import React, { useEffect, useState } from 'react';
import api from '../services/api';

const IssueList = ({ refreshTrigger }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const response = await api.get('/issues');
            setIssues(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load issues.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [refreshTrigger]);

    if (loading && issues.length === 0) {
        return <div className="text-center py-4 text-gray-500">Loading issues...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Recent Issues</h3>

            {issues.length === 0 ? (
                <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    No issues logged yet.
                </p>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {issues.map((issue) => (
                            <li key={issue.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{issue.issue_text}</p>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(issue.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default IssueList;
