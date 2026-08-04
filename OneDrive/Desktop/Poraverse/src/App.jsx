import React, { useState } from 'react';
import { PoraverseProvider } from './context/PoraverseContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Feed from './pages/Feed';
import ClassroomConnect from './pages/ClassroomConnect';
import QAForum from './pages/QAForum';
import Marketplace from './pages/Marketplace';
import TomarShikkhok from './pages/TomarShikkhok';
import TuitionMedia from './pages/TuitionMedia';

function App() {
  const [activeTab, setActiveTab] = useState('feed');

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'classroom':
        return <ClassroomConnect />;
      case 'qa':
        return <QAForum />;
      case 'marketplace':
        return <Marketplace />;
      case 'ai-tutor':
        return <TomarShikkhok />;
      case 'tuition':
        return <TuitionMedia />;
      default:
        return <Feed />;
    }
  };

  return (
    <PoraverseProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflowX: 'hidden'
      }}>
        {/* Sticky Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 3-Column Content Layout */}
        <div style={{
          display: 'flex',
          maxWidth: '1250px',
          width: '100%',
          margin: '0 auto',
          padding: '0 8px',
          boxSizing: 'border-box'
        }}>
          {/* Column 1: Left Navigation Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Column 2: Middle Main Scrollable Panel */}
          <main style={{
            flex: 1,
            padding: '16px 24px',
            minWidth: '0', // prevents grid blowout
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {renderContent()}
          </main>

          {/* Column 3: Right Events & Sponsors Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </PoraverseProvider>
  );
}

export default App;
