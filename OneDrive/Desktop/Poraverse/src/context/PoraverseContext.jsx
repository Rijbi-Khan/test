import React, { createContext, useState, useEffect } from 'react';

export const PoraverseContext = createContext();

export const PoraverseProvider = ({ children }) => {
  // Initialize mock user: Class 9 student from a rural village in Kurigram, Bangladesh
  const [currentUser, setCurrentUser] = useState({
    id: 'user-1',
    name: 'Tahmid Rahman',
    email: 'tahmid@poraverse.edu.bd',
    className: 'Class 9',
    district: 'Kurigram',
    areaType: 'Rural',
    walletBalance: 0.0,
    badges: [],
    joinedDate: '2026-06-15'
  });

  // Mock list of educational notes and videos
  const [posts, setPosts] = useState([
    {
      id: 'post-1',
      title: 'HSC Physics: Work, Energy & Power Class Note',
      type: 'Note',
      content: 'This note covers the complete work-energy theorem, conservative and non-conservative forces, and spring constant derivations with solved mathematical examples from previous board questions.',
      className: 'HSC',
      subject: 'Physics',
      creatorName: 'Ayman Sadiq (Dhaka)',
      creatorId: 'user-100',
      views: 342,
      likes: 89,
      revenueGenerated: 42.50,
      downloadUrl: '#',
      createdAt: '2026-07-12'
    },
    {
      id: 'post-2',
      title: 'Class 9 Mathematics: Detailed Geometry Solutions (Chapter 6)',
      type: 'Note',
      content: 'Handwritten high-quality guide for Theorem 15 and 16. Helpful for students preparing for half-yearly exams. Shared from Notre Dame College school section.',
      className: 'Class 9',
      subject: 'Higher Math',
      creatorName: 'Rabby Islam (Dhaka)',
      creatorId: 'user-101',
      views: 520,
      likes: 120,
      revenueGenerated: 75.00,
      downloadUrl: '#',
      createdAt: '2026-07-13'
    },
    {
      id: 'post-3',
      title: 'Ecology & Ecosystem: Environmental Science Lecture',
      type: 'Video',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-a-green-plant-41551-large.mp4',
      description: 'Understanding the nitrogen cycle and trophic levels. Learn how environmental social campaigns help restore ecosystems in Bangladesh.',
      className: 'Class 9',
      subject: 'Biology',
      creatorName: 'Dr. Sabrina (Dhaka)',
      creatorId: 'user-102',
      views: 891,
      likes: 215,
      revenueGenerated: 145.20,
      createdAt: '2026-07-14'
    },
    {
      id: 'post-4',
      title: 'Chemistry: Balancing Redox Reactions in 5 Minutes',
      type: 'Video',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chemical-flasks-reacting-in-a-lab-41680-large.mp4',
      description: 'A quick short video explaining the ion-electron method to balance complex redox reactions step by step.',
      className: 'HSC',
      subject: 'Chemistry',
      creatorName: 'Niaz Hasan (Chittagong)',
      creatorId: 'user-103',
      views: 124,
      likes: 35,
      revenueGenerated: 20.80,
      createdAt: '2026-07-14'
    }
  ]);

  // Mock Q&A Database
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      title: 'How do I prove the Archimedes Principle mathematically?',
      details: 'I understand that buoyant force equals the weight of the displaced fluid, but how do we prove it using fluid pressure equations at different depths?',
      className: 'Class 9',
      subject: 'Physics',
      askerName: 'Sajid Islam (Rangpur)',
      askerId: 'user-200',
      createdAt: '2026-07-13',
      answers: [
        {
          id: 'a-1',
          questionId: 'q-1',
          content: 'Buoyant force is F_b = F_bottom - F_top. Let the cylinder have height h and area A. Pressure at top depth h1 is P1 = h1 * rho * g, so F_top = h1 * rho * g * A. At bottom h2 (where h2 = h1 + h), pressure is P2 = h2 * rho * g, so F_bottom = h2 * rho * g * A. Net force = F_bottom - F_top = (h2 - h1) * rho * g * A = h * A * rho * g = V * rho * g = m_fluid * g = weight of displaced fluid. Proved!',
          answererName: 'Naveed Kabir (Dhaka College)',
          answererId: 'user-201',
          upvotes: 18,
          createdAt: '2026-07-14'
        }
      ]
    },
    {
      id: 'q-2',
      title: 'What are the main causes of riverbank erosion in Bangladesh?',
      details: 'Looking for both physical environmental factors and human-induced factors for our Social Work campaign presentation.',
      className: 'HSC',
      subject: 'Geography',
      askerName: 'Mitu Akter (Sirajganj)',
      askerId: 'user-202',
      createdAt: '2026-07-14',
      answers: []
    }
  ]);

  // Mock Marketplace Items (Resell and Donate)
  const [marketplaceItems, setMarketplaceItems] = useState([
    {
      id: 'item-1',
      title: 'Panjeree Class 9 Math Guide (Full Set)',
      type: 'Resell',
      originalPrice: 1200,
      systemPrice: 120, // Auto calculated at 10%
      condition: 'Good (No torn pages)',
      subject: 'Math',
      className: 'Class 9',
      imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60',
      ownerName: 'Naimur Rahman (Dhaka)',
      ownerId: 'user-300',
      status: 'Available',
      location: 'Mirpur, Dhaka'
    },
    {
      id: 'item-2',
      title: 'HSC Chemistry Royal Guide - Paper 1 & 2',
      type: 'Resell',
      originalPrice: 1500,
      systemPrice: 150, // Auto calculated
      condition: 'Like New',
      subject: 'Chemistry',
      className: 'HSC',
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60',
      ownerName: 'Tasnia Farin (Sylhet)',
      ownerId: 'user-301',
      status: 'Available',
      location: 'Zindabazar, Sylhet'
    },
    {
      id: 'item-3',
      title: 'Government High School Blue Dress & Tie (Male)',
      type: 'Donate',
      originalPrice: 2000,
      systemPrice: 0, // Free
      condition: 'Used (Fit for Height 5ft 2in)',
      subject: 'School Uniform',
      className: 'Class 8',
      imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&auto=format&fit=crop&q=60',
      ownerName: 'Sabbir Ahmed (Dhaka)',
      ownerId: 'user-302',
      status: 'Available',
      location: 'Dhanmondi, Dhaka'
    }
  ]);

  // Mock Tuition Listings
  const [tuitions, setTuitions] = useState([
    {
      id: 'tuition-1',
      title: 'Need Home Tutor for Class 9 Student',
      className: 'Class 9',
      subjects: 'Math, Higher Math & Physics',
      location: 'Banasree, Dhaka',
      salary: 6000,
      daysPerWeek: 3,
      guardianName: 'Mrs. Rokeya Begum',
      guardianNumber: '01712-345678',
      status: 'Open',
      requests: ['Amit Hasan', 'Jasmine Akter'],
      confirmedTutor: null,
      hasPaidUnlock: false
    },
    {
      id: 'tuition-2',
      title: 'Looking for HSC Science Group Online Tutor',
      className: 'HSC',
      subjects: 'Chemistry & Biology',
      location: 'Online (Anywhere in Bangladesh)',
      salary: 5000,
      daysPerWeek: 3,
      guardianName: 'Dr. Mujibur Rahman',
      guardianNumber: '01891-998822',
      status: 'Open',
      requests: [],
      confirmedTutor: null,
      hasPaidUnlock: false
    }
  ]);

  // Social/Disaster Campaigns
  const [campaigns, setCampaigns] = useState([
    {
      id: 'camp-1',
      title: 'Flood Relief 2026: Sylhet & Sunamganj Campaign',
      description: 'Support students affected by the devastating floods. We are raising funds to distribute textbook bundles, school bags, and stationery items.',
      raisedAmount: 145000,
      targetAmount: 500000,
      volunteersCount: 42,
      joinedVolunteers: []
    },
    {
      id: 'camp-2',
      title: 'Poraverse Tree Plantation Campaign 2026',
      description: 'Plant a tree in your school yard or home. Upload a photo with the tag #GreenPoraverse to earn the "Green Guardian" digital badge.',
      raisedAmount: 25000,
      targetAmount: 50000,
      volunteersCount: 184,
      joinedVolunteers: []
    }
  ]);

  // User Actions
  const updateProfile = (updatedFields) => {
    setCurrentUser(prev => ({ ...prev, ...updatedFields }));
  };

  const addPost = (newPost) => {
    const postWithId = {
      ...newPost,
      id: `post-${posts.length + 1}`,
      creatorName: currentUser.name + ` (${currentUser.district})`,
      creatorId: currentUser.id,
      views: 0,
      likes: 0,
      revenueGenerated: 0.00,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setPosts([postWithId, ...posts]);
  };

  // Simulates watching a video ad and getting a split
  const triggerAdRevenue = (postId) => {
    const adPayout = 2.50; // Each ad generates 2.50 BDT for creator
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            views: p.views + 1,
            revenueGenerated: parseFloat((p.revenueGenerated + adPayout).toFixed(2))
          };
        }
        return p;
      })
    );
    
    // Check if the viewer is the creator - if they are, they don't get payed just by watching. 
    // But for simulation, let's update the wallet of the post creator!
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost) {
      // Find the creator and add to their wallet balance in our system
      // For simplicity, let's update the currentUser's wallet if they created the post, 
      // or just increase overall current user wallet to show the effect of monetization.
      if (targetPost.creatorId === currentUser.id) {
        setCurrentUser(prev => ({
          ...prev,
          walletBalance: parseFloat((prev.walletBalance + adPayout).toFixed(2))
        }));
      }
    }
  };

  const askQuestion = (title, details, className, subject) => {
    const newQuestion = {
      id: `q-${questions.length + 1}`,
      title,
      details,
      className,
      subject,
      askerName: currentUser.name + ` (${currentUser.district})`,
      askerId: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      answers: []
    };
    setQuestions([newQuestion, ...questions]);
  };

  const answerQuestion = (questionId, content) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => {
        if (q.id === questionId) {
          const newAnswer = {
            id: `a-${q.answers.length + 1}`,
            questionId,
            content,
            answererName: currentUser.name + ` (${currentUser.district})`,
            answererId: currentUser.id,
            upvotes: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };
          return {
            ...q,
            answers: [...q.answers, newAnswer]
          };
        }
        return q;
      })
    );
  };

  const addMarketplaceItem = (item) => {
    const newItem = {
      ...item,
      id: `item-${marketplaceItems.length + 1}`,
      ownerName: currentUser.name + ` (${currentUser.district})`,
      ownerId: currentUser.id,
      status: 'Available',
      // Auto-pricing: if resell, system price is 10% of original. If donate, system price is 0.
      systemPrice: item.type === 'Resell' ? Math.round(item.originalPrice * 0.1) : 0
    };
    setMarketplaceItems([newItem, ...marketplaceItems]);
  };

  // Buy or Donate flow
  const purchaseMarketplaceItem = (itemId) => {
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item) return;

    setMarketplaceItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, status: 'Sold' } : i))
    );

    // If it was a donation, award the user a "Shikhsha Bandhu" badge
    if (item.type === 'Donate') {
      if (!currentUser.badges.includes('Shikhsha Bandhu')) {
        setCurrentUser(prev => ({
          ...prev,
          badges: [...prev.badges, 'Shikhsha Bandhu']
        }));
      }
    } else {
      // If resell, simulate paying the seller.
    }
  };

  const joinCampaign = (campId) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === campId && !c.joinedVolunteers.includes(currentUser.id)) {
          // Award badge: "Green Guardian" for tree planting or "Flood Hero" for flood relief
          let badgeName = c.id === 'camp-2' ? 'Green Guardian' : 'Flood Relief Hero';
          if (!currentUser.badges.includes(badgeName)) {
            setCurrentUser(prevUser => ({
              ...prevUser,
              badges: [...prevUser.badges, badgeName]
            }));
          }
          return {
            ...c,
            volunteersCount: c.volunteersCount + 1,
            joinedVolunteers: [...c.joinedVolunteers, currentUser.id]
          };
        }
        return c;
      })
    );
  };

  const addTuition = (newTuition) => {
    const tuitionObj = {
      id: `tuition-${tuitions.length + 1}`,
      ...newTuition,
      guardianNumber: newTuition.guardianNumber || '01912-345678',
      status: 'Open',
      requests: [],
      confirmedTutor: null,
      hasPaidUnlock: false
    };
    setTuitions([tuitionObj, ...tuitions]);
  };

  const applyForTuition = (tuitionId, applicantName) => {
    setTuitions(prev => prev.map(t => {
      if (t.id === tuitionId) {
        if (!t.requests.includes(applicantName)) {
          return { ...t, requests: [...t.requests, applicantName] };
        }
      }
      return t;
    }));
  };

  const confirmTutor = (tuitionId, tutorName) => {
    setTuitions(prev => prev.map(t => {
      if (t.id === tuitionId) {
        return { ...t, confirmedTutor: tutorName, status: 'Confirmed' };
      }
      return t;
    }));
  };

  const cancelConfirmation = (tuitionId, role) => {
    setTuitions(prev => prev.map(t => {
      if (t.id === tuitionId) {
        // Guardian can cancel only if payment is not made yet.
        // Teacher can cancel anytime.
        if (role === 'tutor' || !t.hasPaidUnlock) {
          return { ...t, confirmedTutor: null, status: 'Open', hasPaidUnlock: false };
        }
      }
      return t;
    }));
  };

  const payUnlockFee = (tuitionId) => {
    setTuitions(prev => prev.map(t => {
      if (t.id === tuitionId) {
        return { ...t, hasPaidUnlock: true };
      }
      return t;
    }));
  };

  const withdrawBalance = () => {
    const amount = currentUser.walletBalance;
    if (amount <= 0) return false;
    
    setCurrentUser(prev => ({ ...prev, walletBalance: 0.0 }));
    return amount;
  };

  return (
    <PoraverseContext.Provider value={{
      currentUser,
      posts,
      questions,
      marketplaceItems,
      tuitions,
      campaigns,
      updateProfile,
      addPost,
      triggerAdRevenue,
      askQuestion,
      answerQuestion,
      addMarketplaceItem,
      purchaseMarketplaceItem,
      joinCampaign,
      addTuition,
      applyForTuition,
      confirmTutor,
      cancelConfirmation,
      payUnlockFee,
      withdrawBalance
    }}>
      {children}
    </PoraverseContext.Provider>
  );
};
