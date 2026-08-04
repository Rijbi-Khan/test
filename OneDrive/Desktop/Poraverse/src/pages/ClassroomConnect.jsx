import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  Bell, 
  ArrowRight, 
  BookOpen, 
  MapPin, 
  Bookmark, 
  Download,
  Users,
  Pin,
  FileText
} from 'lucide-react';

const ClassroomConnect = () => {
  const { posts, currentUser, addPost } = useContext(PoraverseContext);
  const [showQuickShare, setShowQuickShare] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  // Filter notes that match the current user's class (e.g. Class 9)
  const classNotes = posts.filter(
    (post) => post.className === currentUser.className && post.type === 'Note'
  );

  // Separate notes shared by creators from Dhaka or other urban centers
  const dhakaNotes = posts.filter(
    (post) => post.className === currentUser.className && 
              post.type === 'Note' && 
              post.creatorName.includes('Dhaka')
  );

  const handleQuickShare = (e) => {
    e.preventDefault();
    if (!noteTitle || !noteBody) return;

    addPost({
      title: noteTitle,
      type: 'Note',
      content: noteBody,
      subject: 'General Science',
      className: currentUser.className
    });

    setNoteTitle('');
    setNoteBody('');
    setShowQuickShare(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }} className="animate-fade-in">
      
      {/* FACEBOOK GROUP BANNER */}
      <div className="fb-card" style={{ overflow: 'hidden' }}>
        <div style={{
          width: '100%',
          height: '140px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(59, 130, 246, 0.3))',
          display: 'flex',
          alignItems: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Classroom Connect: {currentUser.className}
          </h2>
        </div>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Official Bridge Group</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} />
              Public Group • Connecting peers in Bangladesh
            </span>
          </div>
          <button 
            onClick={() => setShowComposerForm(!showQuickShare)} 
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Create post
          </button>
        </div>
      </div>

      {/* PINNED ANNOUNCEMENT (DAILY REMINDER) */}
      <div className="fb-card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--primary)' }}>
          <Pin size={16} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Pinned Announcement
          </span>
        </div>
        
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
          প্রিয় ছোট্ট বন্ধু, আজকে তুমি নতুন কী শিখতে পারলে?
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
          সেগুলো তুমি আমাদের মাধ্যমে তুলে ধরো, যাতে সারা বাংলাদেশের অন্য শিক্ষার্থীরাও তা শিখতে পারে!
        </p>

        <button 
          onClick={() => setShowQuickShare(!showQuickShare)}
          className="btn btn-outline"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Share what you learned
          <ArrowRight size={12} />
        </button>

        {showQuickShare && (
          <form onSubmit={handleQuickShare} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }} className="animate-fade-in">
            <input 
              type="text" 
              placeholder="What topic did you learn today?" 
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="form-input"
              required
            />
            <textarea 
              placeholder="Explain it simply for your classmates..." 
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              className="form-textarea"
              rows="3"
              required
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowQuickShare(false)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                Post note
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SPLIT LAYOUT FOR NOTES & FEATURED FILE LISTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', alignItems: 'start' }}>
        
        {/* Left Column: Group Notes Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '4px' }}>
            Discussion / Study Notes
          </span>

          {classNotes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No group notes available yet.</p>
          ) : (
            classNotes.map(note => (
              <div key={note.id} className="fb-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {note.creatorName[0]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{note.creatorName}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {note.createdAt} • Subject: <strong style={{ color: 'var(--primary-light)' }}>{note.subject}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{note.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {note.content}
                  </p>
                </div>

                <div style={{
                  display: 'flex', justify: 'space-between', alignItems: 'center',
                  borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    Author: {note.creatorName.split(' ')[0]}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      <Bookmark size={12} />
                      Save
                    </button>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      <Download size={12} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Featured Files shared by Dhaka Peers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '4px' }}>
            Featured Dhaka Notes Bridge
          </span>

          <div className="fb-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Study resources uploaded by students from top institutes of Dhaka (Dhaka College, NDC, Viqarunnisa) matching your class class.
            </p>

            {dhakaNotes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No notes shared by Dhaka peers yet.</p>
            ) : (
              dhakaNotes.map(note => (
                <div key={note.id} style={{
                  display: 'flex', gap: '8px', alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '4px'
                }}>
                  <FileText size={20} style={{ color: 'var(--primary)', marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {note.title.substring(0, 45)}...
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {note.subject} • By {note.creatorName.split(' ')[0]} (Dhaka)
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '2px 0', fontSize: '0.7rem', color: 'var(--primary-light)', alignSelf: 'flex-start' }}>
                      Download note
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ClassroomConnect;
