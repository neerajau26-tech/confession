import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Compass, MessageSquare, Music, ArrowLeft, Plus, Settings, Bell, Share2, AlertCircle, PlayCircle, Search, X, LayoutGrid, Cloud, Star } from 'lucide-react';

// --- Types ---
interface Confession {
  id: number;
  message: string;
  likes: number;
  created_at: string;
}

type View = 'landing' | 'form' | 'feed' | 'detail';

// --- Components ---

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: string; duration: string; delay: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev.slice(-15),
        {
          id: Date.now(),
          left: `${Math.random() * 100}%`,
          size: `${Math.random() * 20 + 10}px`,
          duration: `${Math.random() * 10 + 10}s`,
          delay: `${Math.random() * 5}s`
        }
      ]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart text-primary/10"
          style={{
            left: heart.left,
            fontSize: heart.size,
            animationDuration: heart.duration,
            animationDelay: heart.delay,
            bottom: '-50px'
          }}
        >
          <Heart fill="currentColor" />
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);

  const fetchConfessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/confessions');
      const data = await res.json();
      setConfessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'feed') {
      fetchConfessions();
    }
  }, [view]);

  const handleSelectConfession = (confession: Confession) => {
    setSelectedConfession(confession);
    setView('detail');
  };

  const handleLike = async (id: number) => {
    try {
      const res = await fetch(`/api/confessions/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setConfessions(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
        if (selectedConfession?.id === id) {
          setSelectedConfession(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-primary/20">
      <FloatingHearts />
      
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingView key="landing" onStart={() => setView('form')} onBrowse={() => setView('feed')} />
        )}
        {view === 'form' && (
          <ConfessionFormView 
            key="form" 
            onBack={() => setView('landing')} 
            onSuccess={() => setView('feed')} 
          />
        )}
        {view === 'feed' && (
          <FeedView 
            key="feed" 
            confessions={confessions} 
            loading={loading}
            onBack={() => setView('landing')} 
            onAdd={() => setView('form')}
            onRefresh={fetchConfessions}
            onSelect={handleSelectConfession}
            onLike={handleLike}
          />
        )}
        {view === 'detail' && selectedConfession && (
          <ConfessionDetailView
            key="detail"
            confession={selectedConfession}
            onBack={() => setView('feed')}
            onLike={handleLike}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const LandingView = ({ onStart, onBrowse }: { onStart: () => void; onBrowse: () => void; key?: string | number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-screen w-full flex-col items-center justify-start dreamy-gradient overflow-hidden"
    >
      {/* Navigation Bar */}
      <nav className="relative z-20 w-full max-w-7xl flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="text-white" size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">Secret<span className="text-primary">Hearts</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          <a href="#" className="hover:text-primary transition-colors">Home</a>
          <a href="#" className="hover:text-primary transition-colors">The Wall</a>
          <a href="#" className="hover:text-primary transition-colors">Community</a>
        </div>

        <button className="px-8 py-2.5 bg-white/80 backdrop-blur-md border border-white/60 rounded-full text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
          Join Us
        </button>
      </nav>

      {/* Dreamy Illustrations (Absolute) */}
      <motion.div 
        animate={{ x: [-30, 30, -30], y: [0, 10, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] left-[8%] text-pink-200"
      >
        <Cloud size={140} fill="currentColor" />
      </motion.div>
      <motion.div 
        animate={{ x: [30, -30, 30], y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[12%] text-lavender-200"
      >
        <Cloud size={110} fill="currentColor" />
      </motion.div>
      
      <div className="absolute top-1/3 right-[15%] text-yellow-200/80 animate-sparkle">
        <Star size={40} fill="currentColor" />
      </div>
      <div className="absolute bottom-1/4 left-[15%] text-pink-300/80 animate-sparkle delay-700">
        <Heart size={32} fill="currentColor" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center flex-grow justify-center px-6 -mt-10">
        {/* Headline Section */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-white/60 backdrop-blur-md rounded-full border border-white/60 mb-8 shadow-sm">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">A Magical Space for Two</span>
          </div>
          <h1 className="text-slate-800 tracking-tighter text-[64px] md:text-[96px] font-cursive leading-[0.8] mb-8">
            <span className="text-primary drop-shadow-sm">Our Little Secret</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-2xl font-medium leading-relaxed max-w-[600px] mx-auto font-serif italic">
            "A soft whisper, a shared smile, and a heart full of magic."
          </p>
        </motion.div>

        {/* Hero Image Section (Romantic Duo) */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="relative w-full max-w-[540px] mb-14"
        >
          {/* Soft Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/30 blur-[100px] rounded-full" />
          
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-[100px] border-2 border-white/60 shadow-[0_40px_80px_-20px_rgba(238,43,108,0.1)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-lavender-50/50 to-blue-50/50 rounded-[100px] overflow-hidden flex items-center justify-center p-12">
            <div className="flex -space-x-12 items-end relative">
              {/* Romantic Girl */}
              <div className="relative z-10">
                <motion.img 
                  animate={{ y: [0, -8, 0], rotate: [0, -1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  src="https://api.dicebear.com/7.x/lorelei/png?seed=Luna&backgroundColor=fdf2f8&mouth=happy,smile&eyes=variant04&hair=variant02" 
                  alt="Romantic Anime Girl" 
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 object-contain drop-shadow-[0_15px_25px_rgba(238,43,108,0.15)]"
                />
              </div>
              
              {/* Romantic Boy */}
              <div className="relative z-0">
                <motion.img 
                  animate={{ y: [0, 8, 0], rotate: [0, 1, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  src="https://api.dicebear.com/7.x/lorelei/png?seed=Kaito&backgroundColor=f0f9ff&mouth=happy,smile&eyes=variant02&hair=variant01" 
                  alt="Romantic Anime Boy" 
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 object-contain drop-shadow-[0_15px_25px_rgba(59,130,246,0.15)]"
                />
              </div>
            </div>
          </div>
          
          {/* Floating Romantic Doodles */}
          <div className="absolute -top-10 -right-10 text-6xl animate-bounce delay-100">💖</div>
          <div className="absolute -bottom-10 -left-10 text-6xl animate-pulse">✨</div>
          <div className="absolute top-1/2 -right-16 text-5xl animate-sparkle">🌸</div>
          <div className="absolute top-1/4 -left-16 text-5xl animate-float-slow">🎀</div>
          
          {/* Tiny Secret Hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0], 
                scale: [0, 1, 0],
                y: [0, -100],
                x: [0, (i % 2 === 0 ? 20 : -20)]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity, 
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute text-primary/40 text-xl"
              style={{ 
                left: `${20 + i * 12}%`, 
                bottom: '10%' 
              }}
            >
              <Heart fill="currentColor" size={16} />
            </motion.div>
          ))}
        </motion.div>

        {/* Primary Action */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-lg">
          <motion.button 
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative flex flex-1 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[40px] h-20 px-10 bg-primary text-white text-2xl font-black tracking-tight shadow-[0_25px_50px_-12px_rgba(238,43,108,0.3)] transition-all"
          >
            <MessageSquare className="mr-3" size={28} />
            <span>Enter ✨</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBrowse}
            className="flex flex-1 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[40px] h-20 px-10 bg-white/90 backdrop-blur-md text-slate-600 text-xl font-bold border border-white/80 shadow-xl shadow-black/5"
          >
            <Compass className="mr-3" size={28} />
            <span>The Wall</span>
          </motion.button>
        </div>
      </div>

      {/* Footer Visual */}
      <div className="relative z-10 w-full flex justify-center py-12">
        <div className="flex items-center gap-8 py-5 px-10 glass rounded-[32px]">
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md">
                <img src={`https://api.dicebear.com/7.x/lorelei/png?seed=${i + 20}`} alt="user" />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-800 tracking-tight">Our Growing Sanctuary</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">50,000+ Hearts Shared</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ConfessionFormView = ({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void; key?: string | number }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-bg-light flex justify-center"
    >
      <div className="w-full max-w-[430px] flex flex-col h-full overflow-y-auto pb-10">
        <header className="sticky top-0 z-50 flex items-center bg-bg-light/80 backdrop-blur-lg p-4 pb-2 justify-between">
          <button onClick={onBack} className="text-slate-900 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <X size={24} />
          </button>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Write Your Confession</h2>
          <div className="flex w-12 items-center justify-end">
            <button 
              onClick={handleSubmit}
              disabled={!message || submitting}
              className="text-primary text-base font-bold leading-normal tracking-wide hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              Post
            </button>
          </div>
        </header>

        <main className="flex flex-col gap-6 px-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 text-sm font-semibold px-1">Your Confession</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex w-full rounded-2xl text-slate-900 border-2 border-primary/20 bg-primary/5 focus:border-primary focus:ring-0 min-h-[240px] placeholder:text-primary/40 p-4 text-base font-medium leading-relaxed resize-none transition-all outline-none" 
              placeholder="Share your heartfelt secret..."
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <button 
              onClick={handleSubmit}
              disabled={!message || submitting}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              <Send size={20} />
              {submitting ? 'Sending...' : 'Send Anonymously'}
            </button>
            <p className="text-center text-slate-500 text-xs px-8">
              By posting, you agree to our community guidelines. Be kind, be real.
            </p>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

const FeedView = ({ confessions, loading, onBack, onAdd, onRefresh, onSelect, onLike }: { confessions: Confession[]; loading: boolean; onBack: () => void; onAdd: () => void; onRefresh: () => void; onSelect: (c: Confession) => void; onLike: (id: number) => void; key?: string | number }) => {
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto flex h-full min-h-screen max-w-[430px] flex-col bg-bg-light shadow-2xl"
    >
      <header className="sticky top-0 z-50 bg-bg-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 pb-2 justify-between">
          <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold leading-tight tracking-tight flex-1 text-center">Confession Wall</h2>
          <div className="flex size-10 items-center justify-end">
            <button 
              onClick={() => setLayout(prev => prev === 'list' ? 'grid' : 'list')}
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              {layout === 'list' ? <LayoutGrid size={20} /> : <Settings size={20} className="rotate-90" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading secrets...</p>
          </div>
        ) : confessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
              <MessageSquare size={40} />
            </div>
            <p className="text-slate-500 font-medium">No confessions yet.<br/>Be the first to share a secret!</p>
            <button onClick={onAdd} className="text-primary font-bold underline">Confess Now</button>
          </div>
        ) : (
          <div className={layout === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-6'}>
            {confessions.map((c, i) => (
              layout === 'grid' ? (
                <ConfessionGridItem key={c.id} confession={c} index={i} onClick={() => onSelect(c)} onLike={() => onLike(c.id)} />
              ) : (
                <ConfessionCard key={c.id} confession={c} index={i} onClick={() => onSelect(c)} onLike={() => onLike(c.id)} />
              )
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 z-50 w-full max-w-[430px] border-t border-primary/10 bg-white/90 backdrop-blur-lg px-4 pb-6 pt-2">
        <div className="flex justify-around items-center">
          <button onClick={onBack} className="flex flex-col items-center gap-1 text-slate-400">
            <Compass size={24} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
          </button>
          <button onClick={onAdd} className="flex flex-col items-center gap-1 text-slate-400">
            <Plus size={24} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Confess</p>
          </button>
          <button onClick={onRefresh} className="flex flex-col items-center gap-1 text-primary">
            <MessageSquare size={24} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Wall</p>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <Settings size={24} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Profile</p>
          </button>
        </div>
      </nav>
    </motion.div>
  );
};

const ConfessionGridItem = ({ confession, index, onClick, onLike }: { confession: Confession; index: number; onClick: () => void; onLike: () => void; key?: string | number }) => {
  const gradients = [
    'from-pink-100 to-orange-100',
    'from-purple-100 to-blue-100',
    'from-green-100 to-teal-100',
    'from-rose-100 to-amber-100'
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`aspect-square rounded-2xl p-4 flex flex-col justify-between bg-gradient-to-br ${gradient} shadow-sm cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <p className="text-sm font-medium text-slate-800 line-clamp-4 font-serif italic">
        "{confession.message}"
      </p>
      <div className="flex items-center justify-end">
        <button 
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className="flex items-center gap-1 text-primary/60 hover:text-primary transition-colors"
        >
          <Heart size={12} fill={confession.likes > 0 ? "currentColor" : "none"} />
          <span className="text-[10px] font-bold">{confession.likes}</span>
        </button>
      </div>
    </motion.div>
  );
};

const ConfessionDetailView = ({ confession, onBack, onLike }: { confession: Confession; onBack: () => void; onLike: (id: number) => void; key?: string | number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[60] bg-bg-light flex justify-center"
    >
      <div className="w-full max-w-[430px] flex flex-col h-full overflow-y-auto soft-gradient">
        <header className="p-4 flex items-center justify-between">
          <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-primary/10 text-primary">
            <ArrowLeft size={20} />
          </button>
          <button className="size-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur-md border border-primary/10 text-primary">
            <Share2 size={20} />
          </button>
        </header>

        <main className="flex-1 px-6 flex flex-col items-center justify-center text-center gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary"
          >
            <Heart size={40} fill={confession.likes > 0 ? "currentColor" : "none"} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <p className="text-3xl font-serif italic text-slate-800 leading-tight">
              "{confession.message}"
            </p>
          </motion.div>
        </main>

        <footer className="p-8 flex flex-col items-center gap-4">
          <button 
            onClick={() => onLike(confession.id)}
            className="w-full py-4 bg-white/60 backdrop-blur-md border border-primary/10 rounded-full text-primary font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            <Heart size={20} fill={confession.likes > 0 ? "currentColor" : "none"} />
            React with Love ({confession.likes})
          </button>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shared on {new Date(confession.created_at).toLocaleDateString()}</p>
        </footer>
      </div>
    </motion.div>
  );
};

const ConfessionCard = ({ confession, index, onClick, onLike }: { confession: Confession; index: number; onClick: () => void; onLike: () => void; key?: string | number }) => {
  const gradients = [
    'from-pink-100 to-orange-100',
    'from-purple-100 to-blue-100',
    'from-green-100 to-teal-100',
    'from-rose-100 to-amber-100'
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.article 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="flex flex-col rounded-xl overflow-hidden shadow-sm bg-white border border-primary/5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className={`w-full aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center p-8 relative`}>
        <p className="text-xl font-medium text-slate-800 text-center leading-relaxed font-serif italic">
          "{confession.message}"
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike(); }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors"
            >
              <Heart size={18} fill={confession.likes > 0 ? "currentColor" : "none"} />
              <span className="text-xs font-bold">{confession.likes}</span>
            </button>
          </div>
          <div className="flex gap-4">
            <button className="text-slate-400 hover:text-primary transition-colors">
              <Share2 size={18} />
            </button>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              <AlertCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};
