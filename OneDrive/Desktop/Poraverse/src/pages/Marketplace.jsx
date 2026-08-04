import React, { useContext, useState } from 'react';
import { PoraverseContext } from '../context/PoraverseContext';
import { 
  ShoppingBag, 
  MapPin, 
  PlusCircle, 
  Smartphone, 
  Award, 
  X, 
  Check, 
  Bookmark,
  ChevronDown
} from 'lucide-react';

const Marketplace = () => {
  const { marketplaceItems, addMarketplaceItem, purchaseMarketplaceItem, currentUser } = useContext(PoraverseContext);

  // States
  const [filterType, setFilterType] = useState('All');
  const [listOpen, setListOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Resell');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('Good (No torn pages)');
  const [className, setClassName] = useState('Class 9');
  const [location, setLocation] = useState('Mirpur, Dhaka');

  // Checkout Sim States
  const [selectedItem, setSelectedItem] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: None, 1: bKash Number, 2: OTP, 3: PIN, 4: Success
  const [mfsPhone, setMfsPhone] = useState('');
  const [mfsOtp, setMfsOtp] = useState('');
  const [mfsPin, setMfsPin] = useState('');
  
  // Donation Success Overlay
  const [donationSuccessItem, setDonationSuccessItem] = useState(null);

  const calculatedResalePrice = originalPrice ? Math.round(Number(originalPrice) * 0.1) : 0;

  const handleListItem = (e) => {
    e.preventDefault();
    if (!title) return;

    addMarketplaceItem({
      title,
      type,
      originalPrice: type === 'Resell' ? Number(originalPrice) : 0,
      condition,
      className,
      location,
      imageUrl: type === 'Resell' 
        ? 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60' 
        : 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=60'
    });

    setTitle('');
    setOriginalPrice('');
    setListOpen(false);
  };

  const startCheckout = (item) => {
    setSelectedItem(item);
    if (item.type === 'Resell') {
      setCheckoutStep(1); // Open bKash flow
    } else {
      setDonationSuccessItem(item);
      purchaseMarketplaceItem(item.id);
    }
  };

  const handleMfsSubmit = (e) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      setCheckoutStep(3);
    } else if (checkoutStep === 3) {
      purchaseMarketplaceItem(selectedItem.id);
      setCheckoutStep(4);
    }
  };

  const closeCheckout = () => {
    setSelectedItem(null);
    setCheckoutStep(0);
    setMfsPhone('');
    setMfsOtp('');
    setMfsPin('');
  };

  const filteredItems = marketplaceItems.filter(item => {
    if (filterType === 'All') return true;
    return item.type === filterType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }} className="animate-fade-in">
      
      {/* MARKETPLACE HERO & LIST ACTION */}
      <div className="fb-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Facebook-Style Marketplace</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Buy & Sell old textbooks at systematic 10% rates, or claim free uniform donations.
          </span>
        </div>
        
        <button onClick={() => setListOpen(!listOpen)} className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
          <PlusCircle size={16} />
          Create Listing
        </button>
      </div>

      {/* COLLAPSIBLE LISTING FORM */}
      {listOpen && (
        <div className="fb-card animate-fade-in" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>List New Item</h3>
          <form onSubmit={handleListItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Item Title (e.g. HSC Chemistry Guide Part 1)" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Resell">Sell (Textbooks & Guides)</option>
                <option value="Donate">Donate Free (School dresses, stationary)</option>
              </select>
              <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="HSC">HSC</option>
              </select>
            </div>

            {type === 'Resell' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <input 
                  type="number" 
                  placeholder="Original Purchase Price (৳)" 
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="form-input"
                  required={type === 'Resell'}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Auto Resale Price (10%):</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>৳{calculatedResalePrice}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="Like New">Like New</option>
                <option value="Good (No torn pages)">Good condition</option>
                <option value="Used (Heavily written)">Written / Used</option>
              </select>
              <input 
                type="text" 
                placeholder="Handover Location (e.g. Dhaka, Rangpur)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setListOpen(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary">List Item</button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER TABS & DETAILS */}
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilterType('All')} className={`btn ${filterType === 'All' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            All Items
          </button>
          <button onClick={() => setFilterType('Resell')} className={`btn ${filterType === 'Resell' ? 'btn-outline' : 'btn-ghost'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Reselling Guides
          </button>
          <button onClick={() => setFilterType('Donate')} className={`btn ${filterType === 'Donate' ? 'btn-outline' : 'btn-ghost'}`} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Donations
          </button>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Active Listings: {filteredItems.length}
        </span>
      </div>

      {/* MARKETPLACE PRODUCT GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        width: '100%'
      }}>
        {filteredItems.map((item) => (
          <div key={item.id} className="fb-card" style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            opacity: item.status === 'Sold' ? 0.5 : 1
          }}>
            
            {/* Status Sold Overlay */}
            {item.status === 'Sold' && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(24, 25, 26, 0.75)',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  transform: 'rotate(-10deg)'
                }}>
                  Sold
                </span>
              </div>
            )}

            {/* Product Image */}
            <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Info */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: item.type === 'Resell' ? 'var(--primary)' : 'var(--accent)' }}>
                {item.type === 'Resell' ? `৳${item.systemPrice}` : 'FREE'}
              </span>
              
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', height: '36px', overflow: 'hidden', lineClamp: 2 }}>
                {item.title}
              </h4>
              
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={10} />
                {item.location}
              </span>

              <button 
                disabled={item.status === 'Sold'}
                onClick={() => startCheckout(item)}
                className={`btn ${item.type === 'Resell' ? 'btn-primary' : 'btn-accent'}`}
                style={{ width: '100%', fontSize: '0.78rem', padding: '6px', marginTop: 'auto' }}
              >
                {item.type === 'Resell' ? 'Buy via bKash' : 'Request'}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MOCK BKASH CHECKOUT OVERLAY */}
      {checkoutStep > 0 && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#e2127d', // bKash Pink
            color: '#fff',
            width: '360px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'sans-serif'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justify: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#d11273', alignItems: 'center' }}>
              <span style={{ fontWeight: 800 }}>bKash Checkout</span>
              <button onClick={closeCheckout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px', background: '#e2127d', borderBottom: '3px solid #b50e63', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Poraverse Marketplace</p>
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedItem.title}</p>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>৳ {selectedItem.systemPrice}</span>
            </div>
            <form onSubmit={handleMfsSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {checkoutStep === 1 && (
                <>
                  <p style={{ fontSize: '0.8rem' }}>Enter bKash account number:</p>
                  <input 
                    type="text" 
                    placeholder="e.g. 017xxxxxxxx" 
                    maxLength={11}
                    value={mfsPhone}
                    onChange={(e) => setMfsPhone(e.target.value)}
                    style={{ background: '#fff', border: 'none', padding: '10px', color: '#333', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" onClick={closeCheckout} style={{ flex: 1, padding: '10px', background: '#b50e63', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', color: '#e2127d', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Proceed</button>
                  </div>
                </>
              )}
              {checkoutStep === 2 && (
                <>
                  <p style={{ fontSize: '0.8rem' }}>Enter OTP sent to {mfsPhone}:</p>
                  <input 
                    type="text" 
                    placeholder="6-digit OTP" 
                    maxLength={6}
                    value={mfsOtp}
                    onChange={(e) => setMfsOtp(e.target.value)}
                    style={{ background: '#fff', border: 'none', padding: '10px', color: '#333', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center', letterSpacing: '4px' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setCheckoutStep(1)} style={{ flex: 1, padding: '10px', background: '#b50e63', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', color: '#e2127d', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Verify</button>
                  </div>
                </>
              )}
              {checkoutStep === 3 && (
                <>
                  <p style={{ fontSize: '0.8rem' }}>Enter 5-digit PIN:</p>
                  <input 
                    type="password" 
                    placeholder="bKash PIN" 
                    maxLength={5}
                    value={mfsPin}
                    onChange={(e) => setMfsPin(e.target.value)}
                    style={{ background: '#fff', border: 'none', padding: '10px', color: '#333', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 700, width: '100%', textAlign: 'center', letterSpacing: '6px' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setCheckoutStep(2)} style={{ flex: 1, padding: '10px', background: '#b50e63', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#fff', border: 'none', color: '#e2127d', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                  </div>
                </>
              )}
              {checkoutStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justify: 'center', color: '#e2127d' }}>
                    <Check size={24} />
                  </div>
                  <h4 style={{ fontWeight: 800 }}>Payment Complete!</h4>
                  <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                    ৳ {selectedItem.systemPrice} processed.<br />Contact seller {selectedItem.ownerName} for delivery.
                  </p>
                  <button type="button" onClick={closeCheckout} style={{ padding: '8px 20px', background: '#fff', border: 'none', color: '#e2127d', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                    Done
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* DONATION SUCCESS OVERLAY */}
      {donationSuccessItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="fb-card animate-fade-in" style={{ width: '360px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Donation Claimed!</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              You claimed: <strong>{donationSuccessItem.title}</strong>.<br />
              We notified donor {donationSuccessItem.ownerName}. You've earned the <strong>"Shikhsha Bandhu"</strong> badge!
            </p>
            <button onClick={() => setDonationSuccessItem(null)} className="btn btn-primary" style={{ padding: '8px 20px' }}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Marketplace;
