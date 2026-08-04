import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  Video, 
  BookOpen, 
  Upload, 
  Sparkles, 
  Play, 
  ThumbsUp, 
  MessageCircle, 
  Share2,
  AlertCircle,
  Globe,
  MoreHorizontal
} from 'lucide-react';

const Feed = () => {
  const { posts, addPost, triggerAdRevenue, currentUser } = useContext(PoraverseContext);
  
  // Post Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Note');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [classRange, setClassRange] = useState('Class 9');
  const [showComposerForm, setShowComposerForm] = useState(false);
  
  // Ad Simulation State
  const [activeAdPostId, setActiveAdPostId] = useState(null);
  const [adCountdown, setAdCountdown] = useState(3);
  const [adEarningsInfo, setAdEarningsInfo] = useState('');

  // Handle uploading content
  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    addPost({
      title,
      type,
      content,
      subject,
      className: classRange,
      videoUrl: type === 'Video' ? 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-green-plant-41551-large.mp4' : undefined
    });

    setTitle('');
    setContent('');
    setShowComposerForm(false);
  };

  // Play Video and Show Ad
  const handlePlayVideo = (postId) => {
    setActiveAdPostId(postId);
    setAdCountdown(3);
    
    // Countdown simulation
    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAdRevenue(postId);
          
          const post = posts.find(p => p.id === postId);
          if (post) {
            if (post.creatorId === currentUser.id) {
              setAdEarningsInfo(`Congratulations! You earned ৳ 2.50 BDT from ad impressions!`);
            } else {
              setAdEarningsInfo(`Educational ad watched. Sponsor revenue split calculated!`);
            }
          }
          
          setTimeout(() => {
            setActiveAdPostId(null);
            setAdEarningsInfo('');
          }, 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }} className="animate-fade-in">
      
      {/* FACEBOOK STYLE COMPOSER BOX */}
      <div className="fb-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
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
          <button 
            onClick={() => setShowComposerForm(!showComposerForm)} 
            className="fb-composer-pill"
          >
            What educational topic did you learn today, {currentUser.name.split(' ')[0]}?
          </button>
        </div>
        
        {/* Quick buttons */}
        <div style={{ display: 'flex', justify: 'space-between', paddingTop: '12px' }}>
          <button onClick={() => { setType('Video'); setShowComposerForm(true); }} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.85rem' }}>
            <Video size={16} style={{ color: 'var(--primary)' }} />
            Educational Video
          </button>
          <button onClick={() => { setType('Note'); setShowComposerForm(true); }} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.85rem' }}>
            <BookOpen size={16} style={{ color: '#3b82f6' }} />
            Class note / PDF
          </button>
          <button onClick={() => { setType('Note'); setShowComposerForm(true); }} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.85rem' }}>
            <Sparkles size={16} style={{ color: '#f59e0b' }} />
            Daily Remind
          </button>
        </div>

        {/* Collapsible uploader form */}
        {showComposerForm && (
          <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }} className="animate-fade-in">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Topic Title (e.g. Acid-Base Equilibrium Notes)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Note">📝 Class Note (PDF)</option>
                <option value="Video">🎥 Educational Video</option>
              </select>
              <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Higher Math">Higher Math</option>
                <option value="Biology">Biology</option>
                <option value="ICT">ICT</option>
              </select>
              <select className="form-select" value={classRange} onChange={(e) => setClassRange(e.target.value)}>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="HSC">HSC</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <textarea 
                rows="3" 
                placeholder={type === 'Video' ? "Describe the video lecture..." : "Paste note description or study guidelines here..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="form-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ℹ️ Uploading short videos triggers instant ad revenue splits.
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowComposerForm(false)} className="btn btn-outline" style={{ padding: '6px 12px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '6px 16px' }}>
                  Post
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* FEED POSTS */}
      {posts.map((post) => (
        <div key={post.id} className="fb-card animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Post Header */}
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {post.creatorName[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{post.creatorName}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    background: post.type === 'Video' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: post.type === 'Video' ? 'var(--secondary)' : 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    {post.type}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{post.createdAt}</span>
                  <span>•</span>
                  <span>{post.className}</span>
                  <span>•</span>
                  <span>{post.subject}</span>
                  <span>•</span>
                  <Globe size={12} />
                </div>
              </div>
            </div>
            
            <button className="btn btn-ghost" style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}>
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Post Content */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{post.title}</h3>
            <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {post.content || post.description}
            </p>
          </div>

          {/* Video Attachment Player */}
          {post.type === 'Video' && (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              background: '#000',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeAdPostId === post.id ? (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(24, 25, 26, 0.95)',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid var(--primary)',
                    borderRadius: '50%',
                    width: '48px', height: '48px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '12px'
                  }}>
                    <AlertCircle size={24} />
                  </div>
                  
                  {adEarningsInfo ? (
                    <h4 style={{ color: 'var(--primary-light)', fontSize: '1rem', fontWeight: 700 }}>
                      {adEarningsInfo}
                    </h4>
                  ) : (
                    <>
                      <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>
                        SPONSOR ADVERTISEMENT
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '12px' }}>
                        Educational Sponsor Campaign
                      </p>
                      <span style={{
                        background: 'rgba(255,255,255,0.08)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        Ad ends in {adCountdown}s
                      </span>
                    </>
                  )}
                </div>
              ) : null}

              <video 
                src={post.videoUrl} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                controls
                onClick={() => handlePlayVideo(post.id)}
              />
              
              <div style={{
                position: 'absolute',
                background: 'rgba(0,0,0,0.5)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                top: '12px',
                right: '12px',
                pointerEvents: 'none'
              }}>
                <Play size={12} style={{ color: '#fff' }} />
                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>Click to play & watch ad</span>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span>👍 {post.likes} likes</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>👁️ {post.views} views</span>
              <span>•</span>
              <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Earned: ৳{post.revenueGenerated.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justify: 'space-between' }}>
            <button className="btn btn-ghost" style={{ flex: 1, gap: '6px', fontSize: '0.82rem' }}>
              <ThumbsUp size={16} />
              Like
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, gap: '6px', fontSize: '0.82rem' }}>
              <MessageCircle size={16} />
              Comment
            </button>
            <button className="btn btn-ghost" style={{ flex: 1, gap: '6px', fontSize: '0.82rem' }}>
              <Share2 size={16} />
              Share
            </button>
          </div>

        </div>
      ))}

    </div>
  );
};

export default Feed;
