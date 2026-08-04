import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  MessageSquare, 
  ThumbsUp, 
  HelpCircle, 
  Send, 
  Filter, 
  PlusCircle,
  MoreHorizontal
} from 'lucide-react';

const QAForum = () => {
  const { questions, askQuestion, answerQuestion, currentUser } = useContext(PoraverseContext);
  
  // States
  const [askOpen, setAskOpen] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qDetails, setQDetails] = useState('');
  const [qSubject, setQSubject] = useState('Physics');
  const [qClass, setQClass] = useState('Class 9');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map of answer inputs per question
  const [newAnswers, setNewAnswers] = useState({});

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!qTitle) return;

    askQuestion(qTitle, qDetails, qClass, qSubject);
    setQTitle('');
    setQDetails('');
    setAskOpen(false);
  };

  const handleAnswerSubmit = (e, qId) => {
    e.preventDefault();
    const answerContent = newAnswers[qId];
    if (!answerContent || !answerContent.trim()) return;

    answerQuestion(qId, answerContent);
    setNewAnswers({ ...newAnswers, [qId]: '' });
  };

  const handleAnswerChange = (qId, val) => {
    setNewAnswers({ ...newAnswers, [qId]: val });
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }} className="animate-fade-in">
      
      {/* Search and Ask header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search questions by subject, class, or keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '36px', height: '40px', borderRadius: '20px', background: '#3a3b3c', border: 'none' }}
          />
          <Filter size={14} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-secondary)' }} />
        </div>
        <button onClick={() => setAskOpen(!askOpen)} className="btn btn-primary" style={{ display: 'flex', gap: '6px', height: '40px', whiteSpace: 'nowrap' }}>
          <PlusCircle size={16} />
          Ask Question
        </button>
      </div>

      {/* Ask Question Form Modal Box */}
      {askOpen && (
        <div className="fb-card animate-fade-in" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--primary)' }} />
            Post Academic Question
          </h3>
          <form onSubmit={handleAskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="What is your question? (Be specific)" 
                value={qTitle}
                onChange={(e) => setQTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <textarea 
                placeholder="Describe your question, show formulas, or explain where you got stuck..." 
                value={qDetails}
                onChange={(e) => setQDetails(e.target.value)}
                className="form-textarea"
                rows="3"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subject</label>
                <select className="form-select" value={qSubject} onChange={(e) => setQSubject(e.target.value)}>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Higher Math">Higher Math</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">For Class</label>
                <select className="form-select" value={qClass} onChange={(e) => setQClass(e.target.value)}>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="HSC">HSC</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" onClick={() => setAskOpen(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary">Post</button>
            </div>
          </form>
        </div>
      )}

      {/* Discussion List */}
      {filteredQuestions.map((q) => (
        <div key={q.id} className="fb-card animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem'
              }}>
                {q.askerName[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{q.askerName}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    background: 'rgba(16,185,129,0.12)',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    {q.className} • {q.subject}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Asked: {q.createdAt}</span>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}>
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Details */}
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {q.title}
            </h3>
            {q.details && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {q.details}
              </p>
            )}
          </div>

          {/* Comments section (Answers) */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2px' }}>
              Answers ({q.answers.length})
            </span>

            {q.answers.map((ans) => (
              <div key={ans.id} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.75rem'
                }}>
                  {ans.answererName[0]}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{ans.answererName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ans.createdAt}</span>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4', marginTop: '2px' }}>
                    {ans.content}
                  </p>

                  <button className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem', alignSelf: 'flex-start', gap: '4px', marginTop: '4px' }}>
                    <ThumbsUp size={10} />
                    Upvote ({ans.upvotes})
                  </button>
                </div>
              </div>
            ))}

            {/* Answer Composer */}
            <form onSubmit={(e) => handleAnswerSubmit(e, q.id)} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '4px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.75rem'
              }}>
                {currentUser.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <textarea 
                  placeholder="Write an explanation..." 
                  value={newAnswers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="form-textarea"
                  rows="1"
                  style={{ width: '100%', height: '36px', padding: '8px 12px', borderRadius: '18px', background: '#3a3b3c', border: 'none', resize: 'none' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '36px', width: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={14} />
              </button>
            </form>

          </div>

        </div>
      ))}

    </div>
  );
};

export default QAForum;
