import React, { useContext } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { Leaf, Award, MapPin, Users } from 'lucide-react';

const RightSidebar = () => {
  const { campaigns, joinCampaign, currentUser } = useContext(PoraverseContext);

  // Sponsored Ads (mocking sponsors to support operational cost)
  const sponsors = [
    {
      id: 'sp-1',
      title: 'bKash - Secure Payments',
      details: 'Pay guidebooks or get matched on Tuition Media instantly with bKash.',
      url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=120&auto=format&fit=crop&q=60'
    },
    {
      id: 'sp-2',
      title: 'Environment Action BD',
      details: 'Plant a tree today, snap a photo and tag #GreenPoraverse for a badge!',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div style={{
      width: '300px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'sticky',
      top: '56px',
      height: 'calc(100vh - 56px)',
      overflowY: 'auto'
    }}>
      
      {/* SPONSORED SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Sponsored (Supporting Operations)
        </span>
        {sponsors.map(sp => (
          <div key={sp.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <img src={sp.url} alt={sp.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sp.title}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{sp.details}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DISASTER & ENVIRONMENTAL CAMPAIGNS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Social & Disaster Campaigns
        </span>
        
        {campaigns.map(camp => {
          const hasJoined = camp.joinedVolunteers.includes(currentUser.id);
          const progress = (camp.raisedAmount / camp.targetAmount) * 100;
          return (
            <div key={camp.id} className="fb-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Leaf size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{camp.title}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {camp.description.substring(0, 80)}...
              </p>
              
              {/* Progress */}
              <div style={{ margin: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '3px' }}>
                  <span>Fund: ৳{camp.raisedAmount.toLocaleString()}</span>
                  <span>Target: ৳{camp.targetAmount.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Users size={10} />
                  {camp.volunteersCount} joined
                </span>
                <button 
                  onClick={() => joinCampaign(camp.id)}
                  disabled={hasJoined}
                  className={`btn ${hasJoined ? 'btn-outline' : 'btn-primary'}`}
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                >
                  {hasJoined ? 'Joined ✔️' : 'Join Campaign'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RightSidebar;
