import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  MapPin, 
  Clock, 
  PlusCircle, 
  Check, 
  Smartphone,
  X,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';

const TuitionMedia = () => {
  const { 
    currentUser, 
    tuitions, 
    addTuition, 
    applyForTuition, 
    confirmTutor, 
    cancelConfirmation, 
    payUnlockFee 
  } = useContext(PoraverseContext);

  // States
  const [filterClass, setFilterClass] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 9');
  const [subjects, setSubjects] = useState('');
  const [location, setLocation] = useState('Dhanmondi, Dhaka');
  const [salary, setSalary] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [guardianName, setGuardianName] = useState('');
  const [guardianNumber, setGuardianNumber] = useState('');

  // Fee modal states
  const [activeTuition, setActiveTuition] = useState(null);
  const [feeStep, setFeeStep] = useState(0); // 0: Close, 1: Details, 2: bKash payment, 3: Completed
  const [mfsPhone, setMfsPhone] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  const [chattingWith, setChattingWith] = useState(null);

  const handlePostTuition = (e) => {
    e.preventDefault();
    if (!title || !subjects || !salary || !guardianName || !guardianNumber) return;

    addTuition({
      title,
      className,
      subjects,
      location,
      salary: Number(salary),
      daysPerWeek: Number(daysPerWeek),
      guardianName,
      guardianNumber
    });

    setTitle('');
    setSubjects('');
    setSalary('');
    setGuardianName('');
    setGuardianNumber('');
    setFormOpen(false);
  };

  const startTutorUnlock = (t) => {
    setActiveTuition(t);
    setFeeStep(1);
  };

  const handleUnlockPaymentSubmit = (e) => {
    e.preventDefault();
    if (feeStep === 2) {
      payUnlockFee(activeTuition.id);
      setFeeStep(3); // Success
    }
  };

  const filteredTuitions = tuitions.filter(t => {
    if (filterClass === 'All') return true;
    return t.className === filterClass;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', width: '100%' }} className="animate-fade-in">
      
      {/* LEFT COLUMN: Tuition listings board */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Header Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setFilterClass('All')} className={`btn ${filterClass === 'All' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              All
            </button>
            <button onClick={() => setFilterClass('Class 9')} className={`btn ${filterClass === 'Class 9' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Class 9
            </button>
            <button onClick={() => setFilterClass('HSC')} className={`btn ${filterClass === 'HSC' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              HSC
            </button>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Jobs: {filteredTuitions.length}
          </span>
        </div>

        {/* Board Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTuitions.map((t) => {
            const hasApplied = t.requests && t.requests.includes(currentUser.name);
            const isConfirmedTutor = t.confirmedTutor === currentUser.name;

            return (
              <div key={t.id} className="fb-card" style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    background: t.status === 'Confirmed' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
                    color: t.status === 'Confirmed' ? 'var(--primary)' : 'var(--secondary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    {t.className} • {t.status === 'Open' ? 'Open for Requests' : `Confirmed to ${t.confirmedTutor}`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Guardian: {t.guardianName}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>{t.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Subjects: <strong style={{ color: '#fff' }}>{t.subjects}</strong>
                  </p>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                  background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', gap: '8px'
                }}>
                  <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <MapPin size={12} style={{ color: 'var(--primary)' }} />
                    {t.location}
                  </span>
                  <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700, color: 'var(--primary-light)' }}>
                    ৳{t.salary.toLocaleString()}/mo
                  </span>
                  <span style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Clock size={12} style={{ color: 'var(--primary)' }} />
                    {t.daysPerWeek} days/wk
                  </span>
                </div>

                {/* --- MOCK NEGOTIATION / STUDENT-GUARDIAN INTERACTION --- */}
                {t.status === 'Open' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                        Requests received ({(t.requests || []).length})
                      </span>
                      {!hasApplied ? (
                        <button 
                          onClick={() => applyForTuition(t.id, currentUser.name)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                        >
                          Send Request (Free)
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>Request Sent ✔️</span>
                      )}
                    </div>

                    {(t.requests || []).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {/* Guardian Warning Note */}
                        <div style={{
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.3)',
                          borderRadius: '6px',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '6px',
                          marginBottom: '4px'
                        }}>
                          <AlertTriangle size={14} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
                          <p style={{ fontSize: '0.72rem', color: '#f59e0b', lineHeight: '1.3' }}>
                            <strong>গুরুত্বপূর্ণ:</strong> আগে শিক্ষকের সাথে কথা বলে ফাইনাল করার পর কনফার্ম করুন। কনফার্ম করার পর আপনি ক্যানসেল করতে পারবেন না যদি না শিক্ষক ক্যানসেল করে।
                          </p>
                        </div>

                        {t.requests.map((reqName) => (
                          <div key={reqName} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.01)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                          }}>
                            <span style={{ fontSize: '0.78rem' }}>👤 {reqName}</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => setChattingWith(reqName)}
                                className="btn btn-ghost" 
                                style={{ padding: '3px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <MessageSquare size={10} /> Chat
                              </button>
                              <button 
                                onClick={() => confirmTutor(t.id, reqName)}
                                className="btn btn-primary"
                                style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No requests yet. Be the first to apply!</p>
                    )}
                  </div>
                )}

                {/* --- LOCKED / CONFIRMED / UNLOCK FLOW --- */}
                {t.status === 'Confirmed' && (
                  <div style={{ 
                    borderTop: '1px solid var(--border-color)', 
                    paddingTop: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {/* Guardian Info panel */}
                    <div style={{
                      background: 'rgba(16,185,129,0.05)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(16,185,129,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                          🎉 Confirmed Tutor: {t.confirmedTutor}
                        </span>
                        
                        {/* Cancel Button (Teacher can always cancel. Guardian can only cancel if not paid yet.) */}
                        <button
                          onClick={() => cancelConfirmation(t.id, t.confirmedTutor === currentUser.name ? 'tutor' : 'guardian')}
                          disabled={t.hasPaidUnlock && t.confirmedTutor !== currentUser.name}
                          className="btn btn-outline"
                          style={{ fontSize: '0.7rem', padding: '3px 8px', borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          Cancel Connection
                        </button>
                      </div>

                      {t.confirmedTutor === currentUser.name ? (
                        <div>
                          {/* Case: Current user is the confirmed teacher */}
                          {!t.hasPaidUnlock ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                🔔 <strong>আপনাকে কনফার্ম করা হয়েছে!</strong> গার্ডিয়ানের সাথে কথা বলে কনফার্ম করুন। গার্ডিয়ানের মোবাইল নম্বর পেতে হলে ১০০ টাকা বিকাশ পেমেন্ট করতে হবে।
                              </p>
                              <button 
                                onClick={() => startTutorUnlock(t)}
                                className="btn btn-primary"
                                style={{ background: '#e2127d', borderColor: '#e2127d', alignSelf: 'flex-start', fontSize: '0.75rem', padding: '6px 12px' }}
                              >
                                Unlock Guardian Number (৳100)
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)' }}>
                              <Unlock size={14} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                Guardian Mobile: {t.guardianNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {/* Case: Guardian is viewing this */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '0.78rem' }}>
                              Teacher contact info will be visible once they process the ৳100 connection fee.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Post jobs requirements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Chat box helper simulation */}
        {chattingWith && (
          <div className="fb-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>💬 Chat with {chattingWith}</span>
              <X size={14} style={{ cursor: 'pointer' }} onClick={() => setChattingWith(null)} />
            </div>
            <div style={{ height: '80px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)', padding: '6px', borderRadius: '4px', fontSize: '0.75rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}><strong>{chattingWith}:</strong> Hello! I am interested in this tuition. Let's discuss details.</p>
              <p style={{ color: 'var(--primary)' }}><strong>You:</strong> Yes, sure. Let's finalize schedule.</p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" placeholder="Type a message..." className="form-input" style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }} readOnly value="Discussing final setup..." />
              <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>Send</button>
            </div>
          </div>
        )}

        <div className="fb-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            Post Tuition Job (Free)
          </h3>
          
          <form onSubmit={handlePostTuition} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="e.g. Need HSC Physics Home Tutor" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="HSC">HSC</option>
              </select>
              <select className="form-select" value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))}>
                <option value={3}>3 days/wk</option>
                <option value={4}>4 days/wk</option>
              </select>
            </div>
            <input 
              type="text" 
              placeholder="Subjects (e.g. Higher Math, Physics)" 
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="form-input"
              required
            />
            <input 
              type="number" 
              placeholder="Monthly Salary (৳)" 
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="form-input"
              required
            />
            <input 
              type="text" 
              placeholder="Handover Location (e.g. Banasree, Dhaka)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Guardian Name" 
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="form-input"
                required
              />
              <input 
                type="text" 
                placeholder="Contact Number" 
                value={guardianNumber}
                onChange={(e) => setGuardianNumber(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
              Publish Post
            </button>
          </form>
        </div>

      </div>

      {/* CONFIRMED TUTOR UNLOCK FEE BKASH DIALOG OVERLAY */}
      {feeStep > 0 && activeTuition && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {feeStep === 1 && (
            <div className="fb-card animate-fade-in" style={{ width: '380px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Unlock Guardian Contact</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                You have been confirmed for: <br /><strong>{activeTuition.title}</strong>.<br /><br />
                To retrieve the contact number of <strong>{activeTuition.guardianName}</strong>, pay a matchmaking connection fee of <strong>৳100 BDT</strong>.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setFeeStep(0)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={() => setFeeStep(2)} className="btn btn-primary" style={{ flex: 1, background: '#e2127d', borderColor: '#e2127d' }}>Pay via bKash</button>
              </div>
            </div>
          )}

          {feeStep === 2 && (
            <div style={{
              background: '#e2127d', // bKash Pink
              color: '#fff', width: '360px', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif'
            }} className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#d11273', alignItems: 'center' }}>
                <span style={{ fontWeight: 800 }}>bKash Payment</span>
                <button onClick={() => setFeeStep(0)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <div style={{ padding: '16px', background: '#e2127d', borderBottom: '3px solid #b50e63', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Tuition Connection Fee</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>Ref: {activeTuition.guardianName}</p>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>৳ 100</span>
              </div>
              <form onSubmit={handleUnlockPaymentSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text" 
                  placeholder="bKash Phone (01xxxxxxxxx)" 
                  maxLength={11}
                  value={mfsPhone}
                  onChange={(e) => setMfsPhone(e.target.value)}
                  style={{ background: '#fff', border: 'none', padding: '10px', color: '#333', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
                  required
                />
                <input 
                  type="password" 
                  placeholder="5-digit PIN" 
                  maxLength={5}
                  value={mfsPin}
                  onChange={(e) => setMfsPin(e.target.value)}
                  style={{ background: '#fff', border: 'none', padding: '10px', color: '#333', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center', letterSpacing: '6px' }}
                  required
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setFeeStep(1)} style={{ flex: 1, padding: '10px', background: '#b50e63', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', color: '#e2127d', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                </div>
              </form>
            </div>
          )}

          {feeStep === 3 && (
            <div className="fb-card animate-fade-in" style={{ width: '380px', padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justify: 'center', color: '#fff' }}>
                <Check size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Number Unlocked!</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Match fee ৳100 processed.<br /><br />
                <strong>Guardian Phone:</strong> {activeTuition.guardianNumber}<br />
                <strong>Address:</strong> {activeTuition.location}<br />
                You can now contact the guardian directly to schedule classes.
              </p>
              <button onClick={() => setFeeStep(0)} className="btn btn-primary" style={{ padding: '8px 20px' }}>Done</button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default TuitionMedia;
