import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  Compass, 
  BookOpen, 
  MessageSquare, 
  ShoppingBag, 
  Cpu, 
  UserCheck, 
  MapPin, 
  Map, 
  Wallet,
  ArrowUpRight,
  Award
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, withdrawBalance } = useContext(PoraverseContext);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdraw = () => {
    const amount = withdrawBalance();
    if (amount > 0) {
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }
  };

  const menuItems = [
    { id: 'feed', name: 'Educational Feed', icon: Compass },
    { id: 'classroom', name: 'Classroom Bridge', icon: BookOpen },
    { id: 'qa', name: 'Q&A Forum', icon: MessageSquare },
    { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag },
    { id: 'ai-tutor', name: 'Tomar Shikkhok AI', icon: Cpu },
    { id: 'tuition', name: 'Tuition Media', icon: UserCheck },
  ];

  return (
    <div style={{
      width: '300px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'sticky',
      top: '56px',
      height: 'calc(100vh - 56px)',
      overflowY: 'auto'
    }}>
      
      {/* Profile shortcut */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px',
        borderRadius: '8px',
        cursor: 'pointer'
      }} className="fb-hover-parent">
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700
        }}>
          {currentUser.name[0]}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentUser.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
            {currentUser.className}
          </span>
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-primary)',
                fontFamily: 'var(--font-primary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              className={isActive ? '' : 'fb-hover-parent'}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary)' : 'var(--primary)' }} />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Location / Status details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '8px' }}>
          MY SCHOOL REGION
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', paddingLeft: '8px' }}>
          <MapPin size={14} style={{ color: 'var(--primary)' }} />
          <span>District: {currentUser.district}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', paddingLeft: '8px' }}>
          <Map size={14} style={{ color: 'var(--primary)' }} />
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--primary-light)',
            padding: '2px 8px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {currentUser.areaType} Area Student
          </span>
        </div>
      </div>

      {/* Badges Earned */}
      {currentUser.badges.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '8px' }}>
            DIGITAL BADGES (SOCIAL ACTIONS)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '8px' }}>
            {currentUser.badges.map((badge, idx) => (
              <span key={idx} style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}>
                <Award size={12} />
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wallet / Earnings widget */}
      <div style={{
        marginTop: 'auto',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CREATOR WALLET</span>
        </div>
        <div style={{ display: 'flex', justify: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>৳ {currentUser.walletBalance.toFixed(2)}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>BDT (Withdraw instantly)</span>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={currentUser.walletBalance <= 0}
          className="btn btn-primary"
          style={{
            padding: '8px 12px',
            fontSize: '0.8rem',
            width: '100%',
            opacity: currentUser.walletBalance <= 0 ? 0.5 : 1,
            cursor: currentUser.walletBalance <= 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          Withdraw via bKash
          <ArrowUpRight size={12} />
        </button>
        {withdrawSuccess && (
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--primary-light)',
            textAlign: 'center',
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease'
          }}>
            Withdrawal initiated to bKash!
          </span>
        )}
      </div>

    </div>
  );
};

export default Sidebar;
