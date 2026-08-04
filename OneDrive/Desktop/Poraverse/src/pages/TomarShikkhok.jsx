import React, { useState, useRef } from 'react';
import { 
  Cpu, 
  Send, 
  Image as ImageIcon, 
  X, 
  HelpCircle,
  Phone,
  Video,
  Info
} from 'lucide-react';

const TomarShikkhok = () => {
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'আসসালামু আলাইকুম! আমি "তোমার শিক্ষক" AI। আমি তোমাকে গণিত, পদার্থবিজ্ঞান, রসায়ন বা যেকোনো পড়াশোনা সংক্রান্ত প্রশ্নের উত্তর ও সমাধান দিতে পারি। অনুগ্রহ করে তোমার পড়াশোনার প্রশ্নটি করো অথবা কোনো নোটের ছবি আপলোড করো।'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoUploadClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto({
        name: file.name,
        previewUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60'
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal && !selectedPhoto) return;

    const userMessage = {
      id: `m-${messages.length + 1}`,
      sender: 'user',
      text: inputVal,
      photo: selectedPhoto ? selectedPhoto.previewUrl : null
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputVal.toLowerCase();
    const isPhoto = !!selectedPhoto;

    setInputVal('');
    setSelectedPhoto(null);

    // AI thinking delay
    setTimeout(() => {
      let aiText = '';
      let isEducational = true;

      const nonEduKeywords = [
        'joke', 'love letter', 'song', 'music', 'game', 'pubg', 'free fire', 'movie', 
        'k-pop', 'girlfriend', 'boyfriend', 'প্রেমের গল্প', 'কৌতুক', 'গান', 'মুভি', 'খেলা',
        'valobasa', 'prem', 'gf', 'bf', 'koutuk'
      ];

      const containsNonEdu = nonEduKeywords.some(keyword => currentInput.includes(keyword));

      if (containsNonEdu) {
        isEducational = false;
        aiText = 'দুঃখিত! আমি "তোমার শিক্ষক" AI, এবং আমাকে শুধুমাত্র শিক্ষামূলক প্রশ্নের উত্তর দেওয়ার জন্য প্রোগ্রাম করা হয়েছে। পড়াশোনার বাইরের কোনো বিষয়ে আমি আলোচনা করতে পারি না। অনুগ্রহ করে পড়াশোনা সংক্রান্ত কোনো প্রশ্ন জিজ্ঞাসা করো।';
      } else if (isPhoto) {
        aiText = 'আমি তোমার আপলোড করা নোটের ছবিটি স্ক্যান করেছি। এখানে একটি গাণিতিক সমীকরণ দেখা যাচ্ছে: "F = G * (m1 * m2) / r^2" (নিউটনের মহাকর্ষ সূত্র)। \n\nমহাকর্ষীয় বল সম্পর্কিত গাণিতিক সমস্যাটির সমাধান নিচে দেওয়া হলো: \n১. G হলো মহাকর্ষীয় ধ্রুবক = 6.674 × 10^-11 N m^2/kg^2। \n২. m1 এবং m2 হলো দুটি বস্তুর ভর। \n৩. r হলো তাদের মধ্যবর্তী দূরত্ব। \nকোনো নির্দিষ্ট মান দেওয়া থাকলে বলের মান বের করা সম্ভব। সূত্রটি নিয়ে আরও কিছু জানতে চাও?';
      } else {
        if (currentInput.includes('force') || currentInput.includes('বল') || currentInput.includes('newton') || currentInput.includes('sutro') || currentInput.includes('sutra')) {
          aiText = 'নিউটনের গতির দ্বিতীয় সূত্রানুসারে: বস্তুর ভরবেগের পরিবর্তনের হার তার ওপর প্রযুক্ত বলের সমানুপাতিক এবং বল যেদিকে ক্রিয়া করে বস্তুর ভরবেগের পরিবর্তনও সেদিকে ঘটে। অর্থাৎ, F = m * a (বল = ভর × ত্বরণ)। ত্বরণের একক m/s^2 এবং বলের একক নিউটন (N)।';
        } else if (currentInput.includes('redox') || currentInput.includes('জারন') || currentInput.includes('বিজারন') || currentInput.includes('rosayon') || currentInput.includes('chemistry') || currentInput.includes('jaron') || currentInput.includes('bijaron')) {
          aiText = 'জারণ-বিজারণ (Redox/Jaron-Bijaron) বিক্রিয়া একই সাথে ঘটে। যে বিক্রিয়ায় কোনো পরমাণু, মূলক বা আয়ন ইলেকট্রন বর্জন করে তাকে জারণ বলে। আর যে বিক্রিয়ায় ইলেকট্রন গ্রহণ ঘটে তাকে বিজারণ বলে। উদাহরণস্বরূপ: Zn + CuSO4 → ZnSO4 + Cu। এখানে দস্তা (Zn) দুটি ইলেকট্রন ছেড়ে জারিত হয়, এবং কপার আয়ন (Cu2+) ইলেকট্রন গ্রহণ করে বিজারিত হয়।';
        } else if (currentInput.includes('math') || currentInput.includes('গণিত') || currentInput.includes('2+2') || currentInput.includes('solve') || currentInput.includes('gonit') || currentInput.includes('somadhan') || currentInput.includes('prosno')) {
          aiText = 'পড়াশোনা সংক্রান্ত গাণিতিক প্রশ্নের সমাধানে সাহায্য করতে পেরে আমার ভালো লাগবে। তোমার নির্দিষ্ট অংক বা গাণিতিক সমস্যাটি আমাকে লিখে দাও অথবা ছবি তুলে শেয়ার করো, আমি সমাধান করে দিচ্ছি!';
        } else {
          aiText = 'তোমার শিক্ষামূলক প্রশ্নটি আমি পেয়েছি। এটি তোমার সিলেবাসের অত্যন্ত গুরুত্বপূর্ণ একটি টপিক। এ বিষয়ে বিস্তারিত বোঝার জন্য কোনো নির্দিষ্ট অধ্যায় বা থিওরি নিয়ে সাহায্য লাগবে? তুমি চাইলে কোনো কঠিন গাণিতিক সমস্যার স্ক্রিনশট বা নোটের ছবিও এখানে পাঠাতে পারো।';
        }
      }

      const aiResponse = {
        id: `m-${messages.length + 2}`,
        sender: 'ai',
        text: aiText,
        isWarning: !isEducational
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', height: 'calc(100vh - 120px)', width: '100%' }} className="animate-fade-in">
      
      {/* MESSENGER MAIN CHAT */}
      <div className="fb-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Messenger Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--primary)',
              color: '#fff',
              width: '36px', height: '36px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>তোমার শিক্ষক (AI Chat)</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-light)' }} />
                Active now
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', color: 'var(--primary)' }}>
            <Phone size={18} style={{ cursor: 'pointer' }} />
            <Video size={18} style={{ cursor: 'pointer' }} />
            <Info size={18} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((m) => {
            const isAI = m.sender === 'ai';
            return (
              <div 
                key={m.id} 
                style={{
                  display: 'flex',
                  justifyContent: isAI ? 'flex-start' : 'flex-end',
                  width: '100%',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: '18px',
                  background: isAI 
                    ? (m.isWarning ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-hover)') 
                    : 'var(--primary)',
                  border: isAI && m.isWarning ? '1px solid #ef4444' : 'none',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  {m.photo && (
                    <div style={{ width: '100%', maxHeight: '150px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2px' }}>
                      <img src={m.photo} alt="Scanned Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <p style={{ fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {m.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Messenger Footer Input */}
        <form onSubmit={handleSendMessage} style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {selectedPhoto && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              background: '#3a3b3c',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: 'var(--primary-light)'
            }}>
              <span>📷 Scanned: {selectedPhoto.name}</span>
              <button type="button" onClick={() => setSelectedPhoto(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={12} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              style={{ display: 'none' }}
              accept="image/*"
            />
            <button 
              type="button"
              onClick={handlePhotoUploadClick}
              className="btn btn-ghost" 
              style={{ padding: 0, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
            </button>
            
            <input 
              type="text" 
              placeholder="Type an educational query..." 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                background: '#3a3b3c',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 16px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
            
            <button type="submit" className="btn btn-primary" style={{ padding: 0, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={14} />
            </button>
          </div>
        </form>

      </div>

      {/* RIGHT COLUMN: Guide & Refusal tests */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div className="fb-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} />
            AI Chat guardrails
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>
            This chatbot rejects any non-educational inquiries. Test the filters below:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setInputVal('Explain Zn + CuSO4 reaction')} className="btn btn-outline" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              👉 Zn + CuSO4 chemistry
            </button>
            <button onClick={() => setInputVal('What is Newton g motions?')} className="btn btn-outline" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'flex-start' }}>
              👉 Newton's laws physics
            </button>
            <button onClick={() => setInputVal('Write a love letter to my class friend')} className="btn btn-outline" style={{ padding: '6px', fontSize: '0.75rem', justifyContent: 'flex-start', border: '1px dashed #ef4444', color: '#fca5a5' }}>
              🚨 Love letter request (Refused)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TomarShikkhok;
