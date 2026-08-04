import React, { useContext } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  Compass, 
  BookOpen, 
  MessageSquare, 
  ShoppingBag, 
  Cpu, 
  UserCheck, 
  Search, 
  Bell, 
  Wallet,
  Menu
} from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useContext(PoraverseContext);

  const tabs = [
    { id: 'feed', name: 'Feed', icon: Compass, label: 'Home Feed' },
    { id: 'classroom', name: 'Classroom', icon: BookOpen, label: 'Classroom Bridge' },
    { id: 'qa', name: 'Q&A', icon: MessageSquare, label: 'Q&A Forum' },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { id: 'ai-tutor', name: 'AI Tutor', icon: Cpu, label: 'Tomar Shikkhok' },
    { id: 'tuition', name: 'Tuition', icon: UserCheck, label: 'Tuition Media' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* LEFT: Logo & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <img 
          src="/logo.jpg"
          alt="Poraverse Logo"
          onClick={() => setActiveTab('feed')}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            objectFit: 'contain',
            background: '#fff',
            cursor: 'pointer',
            boxShadow: '0 2px 8px var(--primary-glow)',
            padding: '2px'
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '-0.5px',
            lineHeight: 1
          }}>
            Poraverse
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>
            EDUCATIONAL NETWORK
          </span>
        </div>
        <div style={{
          position: 'relative',
          marginLeft: '12px',
          display: 'none', // hidden on small screens
          md: 'block' // we will handle basic flex alignment
        }} className="search-box-container">
          <input 
            type="text" 
            placeholder="Search Poraverse..." 
            style={{
              background: '#3a3b3c',
              border: 'none',
              borderRadius: '50px',
              padding: '8px 16px 8px 36px',
              color: '#fff',
              fontSize: '0.9rem',
              width: '200px'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '14px', top: '11px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* MIDDLE: Navigation Tabs */}
      <div style={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        flex: 2
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '75px',
                height: '100%',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              title={tab.label}
            >
              <Icon size={22} style={{ transform: isActive ? 'scale(1.05)' : 'none' }} />
            </button>
          );
        })}
      </div>

      {/* RIGHT: User Wallet, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
        {/* Wallet Pill */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }} title="Click sidebar to withdraw" onClick={() => setActiveTab('feed')}>
          <Wallet size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
            ৳{currentUser.walletBalance.toFixed(2)}
          </span>
        </div>

        {/* Action Circles */}
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#3a3b3c',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <Bell size={16} />
        </button>

        {/* User Avatar */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer'
        }}>
          {currentUser.name[0]}
        </div>
      </div>
    </header>
  );
};

export default Header;
