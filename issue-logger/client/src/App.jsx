import React, { useState } from 'react';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIssueAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">
            Issue Tracker
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Simple & Professional Issue Logging
          </p>
        </header>

        <main>
          <IssueForm onIssueAdded={handleIssueAdded} />
          <div className="mt-12">
            <IssueList refreshTrigger={refreshKey} />
          </div>
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Issue Logger. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default App;
