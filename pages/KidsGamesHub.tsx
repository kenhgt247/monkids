
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, Star, Music, Check, X, 
  Palette, Ghost, Hash, Shapes, Brain, Languages, 
  Apple, HandMetal, Smile, Cloud, Search, Maximize, 
  Sun, Brush, HelpCircle, Volume2
} from 'lucide-react';

// --- TYPES ---
interface GameMeta {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// --- SOUND HELPER ---
const speak = (text: string, lang: 'vi-VN' | 'en-US' = 'vi-VN') => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Giọng cao hơn cho thân thiện với bé
    window.speechSynthesis.speak(utterance);
  }
};

// --- CONFETTI EFFECT (CSS) ---
const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
    {[...Array(20)].map((_, i) => (
      <div 
        key={i} 
        className="absolute w-3 h-3 rounded-full animate-bounce"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-10%`,
          backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)],
          animationDuration: `${1 + Math.random() * 2}s`,
          animationDelay: `${Math.random()}s`
        }}
      />
    ))}
  </div>
);

// --- SHARED WRAPPER ---
const GameWrapper = ({ title, color, bg, onBack, onReset, children, isWon }: any) => (
  <div className={`fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden animate-fade-in`}>
    {isWon && <Confetti />}
    {/* Header */}
    <div className={`${bg} p-4 flex justify-between items-center shadow-lg relative z-10 transition-colors duration-500`}>
      <button onClick={onBack} className="bg-white/30 p-3 rounded-full text-white hover:scale-110 transition-transform active:scale-95">
        <ArrowLeft size={32} strokeWidth={3} />
      </button>
      <h2 className="text-2xl md:text-3xl font-bold text-white font-heading drop-shadow-md tracking-wide animate-pop-in">{title}</h2>
      <button onClick={onReset} className="bg-white/30 p-3 rounded-full text-white hover:rotate-180 transition-transform duration-500 active:scale-95">
        <RefreshCw size={32} strokeWidth={3} />
      </button>
    </div>
    
    {/* Body */}
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center animate-fade-in-up">
        {children}
      </div>
    </div>
  </div>
);

// ================== GAMES IMPLEMENTATION ==================

// 1. Color Match
const GameColorMatch = ({ onBack }: any) => {
  const colors = [
    { id: 'red', name: 'Đỏ', hex: 'bg-red-500', text: 'text-red-500' },
    { id: 'blue', name: 'Xanh Dương', hex: 'bg-blue-500', text: 'text-blue-500' },
    { id: 'green', name: 'Xanh Lá', hex: 'bg-green-500', text: 'text-green-500' },
    { id: 'yellow', name: 'Vàng', hex: 'bg-yellow-400', text: 'text-yellow-500' }
  ];
  const [target, setTarget] = useState(colors[0]);
  const [isWon, setIsWon] = useState(false);

  const init = () => {
    setIsWon(false);
    const t = colors[Math.floor(Math.random() * colors.length)];
    setTarget(t);
    speak(`Bé hãy tìm màu ${t.name}`);
  };
  useEffect(init, []);

  const handleCheck = (c: any) => {
    if (c.id === target.id) {
      setIsWon(true);
      speak('Hoan hô! Đúng rồi!');
      setTimeout(init, 2000);
    } else {
      speak('Sai rồi, thử lại nhé');
    }
  };

  return (
    <GameWrapper title="Tìm Màu Sắc" bg="bg-indigo-500" onBack={onBack} onReset={init} isWon={isWon}>
      <h3 className="text-3xl font-bold mb-8 text-gray-700 text-center font-heading">
        Màu <span className={`${target.text} text-4xl uppercase`}>{target.name}</span> ở đâu?
      </h3>
      <div className="grid grid-cols-2 gap-8">
        {colors.map(c => (
          <button 
            key={c.id} 
            onClick={() => handleCheck(c)} 
            className={`${c.hex} w-32 h-32 rounded-3xl shadow-[0_10px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[10px] hover:scale-105 transition-all border-4 border-white ring-4 ring-gray-100`}
          />
        ))}
      </div>
    </GameWrapper>
  );
};

// 2. Animal Sounds
const GameAnimalSounds = ({ onBack }: any) => {
  const animals = [
    { id: 'dog', name: 'Chó', sound: 'Gâu gâu', icon: '🐶' },
    { id: 'cat', name: 'Mèo', sound: 'Meo meo', icon: '🐱' },
    { id: 'cow', name: 'Bò', sound: 'Mòooo', icon: '🐮' },
    { id: 'pig', name: 'Heo', sound: 'Ụt ịt', icon: '🐷' }
  ];
  const [target, setTarget] = useState(animals[0]);
  const [isWon, setIsWon] = useState(false);

  const init = () => {
    setIsWon(false);
    const t = animals[Math.floor(Math.random() * animals.length)];
    setTarget(t);
    speak(`Con gì kêu ${t.sound}?`);
  };
  useEffect(init, []);

  return (
    <GameWrapper title="Tiếng Kêu" bg="bg-orange-500" onBack={onBack} onReset={init} isWon={isWon}>
      <div 
        className="bg-white px-8 py-6 rounded-3xl shadow-xl mb-10 cursor-pointer animate-float hover:scale-105 transition-transform border-4 border-orange-100"
        onClick={() => speak(target.sound)}
      >
        <Volume2 size={64} className="text-orange-500 mx-auto mb-2" />
        <h3 className="text-4xl font-bold text-orange-600 font-heading">"{target.sound}"</h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {animals.map(a => (
          <button 
            key={a.id} 
            onClick={() => {
              if(a.id === target.id) { setIsWon(true); speak('Chính xác!'); setTimeout(init, 1500); }
              else speak('Chưa đúng đâu');
            }} 
            className="text-7xl bg-white p-6 rounded-3xl shadow-[0_8px_0_#e5e7eb] active:shadow-none active:translate-y-[8px] hover:scale-105 transition-all border-2 border-gray-100"
          >
            {a.icon}
          </button>
        ))}
      </div>
    </GameWrapper>
  );
};

// 3. Number Bubbles
const GameNumbers = ({ onBack }: any) => {
  const [target, setTarget] = useState(1);
  const [bubbles, setBubbles] = useState([1, 2, 3, 4, 5]);

  const pop = (n: number) => {
    if (n === target) {
      speak(`Số ${n}`);
      if (target === 5) {
        speak('Giỏi quá! Hết bóng rồi!');
        setTimeout(() => { setTarget(1); setBubbles([1,2,3,4,5]); }, 2000);
      } else {
        setTarget(t => t + 1);
      }
    } else {
      speak('Chưa đúng');
    }
  };

  return (
    <GameWrapper title="Đếm Số" bg="bg-cyan-500" onBack={onBack} onReset={() => setTarget(1)}>
      <h3 className="text-3xl font-bold mb-10 text-cyan-700 font-heading">Bấm số: <span className="text-6xl text-cyan-500 align-middle ml-2 animate-pulse inline-block">{target}</span></h3>
      <div className="flex gap-4 flex-wrap justify-center">
        {bubbles.map(n => (
          <button 
            key={n} 
            onClick={() => pop(n)} 
            className={`w-24 h-24 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 text-white text-5xl font-bold shadow-lg border-4 border-white/50 transition-all duration-300 ${n < target ? 'scale-0 opacity-0' : 'animate-float hover:scale-110 active:scale-90'}`}
            style={{ animationDelay: `${n * 0.2}s` }}
          >
            {n}
          </button>
        ))}
      </div>
    </GameWrapper>
  );
};

// 4. Shape Finder
const GameShapes = ({ onBack }: any) => {
  const shapes = [
    { id: 'circle', name: 'Tròn', css: 'rounded-full bg-red-400' },
    { id: 'square', name: 'Vuông', css: 'rounded-2xl bg-blue-400' },
    { id: 'triangle', name: 'Tam Giác', css: 'clip-triangle bg-green-400' }
  ];
  const ShapeRender = ({ type, color }: any) => {
    if (type === 'circle') return <div className={`w-24 h-24 rounded-full ${color} border-4 border-white shadow-md`}></div>;
    if (type === 'square') return <div className={`w-24 h-24 rounded-xl ${color} border-4 border-white shadow-md`}></div>;
    if (type === 'triangle') return (
      <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[90px] border-b-green-400 drop-shadow-md transform -translate-y-2"></div>
    );
    return null;
  };

  const [target, setTarget] = useState(shapes[0]);
  const [isWon, setIsWon] = useState(false);

  const init = () => {
    setIsWon(false);
    const t = shapes[Math.floor(Math.random() * shapes.length)];
    setTarget(t);
    speak(`Hình ${t.name} đâu?`);
  };
  useEffect(init, []);

  return (
    <GameWrapper title="Hình Học" bg="bg-purple-500" onBack={onBack} onReset={init} isWon={isWon}>
      <h3 className="text-3xl font-bold mb-12 text-purple-800 font-heading">Tìm hình: {target.name}</h3>
      <div className="flex items-end gap-8">
        {shapes.map(s => (
          <button key={s.id} onClick={() => {
            if(s.id === target.id) { setIsWon(true); speak('Đúng rồi!'); setTimeout(init, 1500); } 
            else speak('Chưa đúng');
          }} className="p-4 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-transform hover:-translate-y-2 active:scale-90">
             <ShapeRender type={s.id} color={s.css.split(' ')[1]} />
          </button>
        ))}
      </div>
    </GameWrapper>
  );
};

// 5. Memory Flip
const GameMemory = ({ onBack }: any) => {
  const items = ['🐶', '🐱', '🐭', '🐰'];
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);

  const init = () => {
    const deck = [...items, ...items]
      .sort(() => Math.random() - 0.5)
      .map((e, i) => ({ id: i, emoji: e }));
    setCards(deck);
    setFlipped([]);
    setSolved([]);
  };
  useEffect(init, []);

  const click = (id: number) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;
    speak('Lật');
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setSolved([...solved, ...newFlipped]);
        setFlipped([]);
        speak('Hay quá!');
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <GameWrapper title="Lật Hình" bg="bg-pink-500" onBack={onBack} onReset={init} isWon={solved.length === 8}>
      <div className="grid grid-cols-4 gap-3">
        {cards.map(c => (
          <button 
            key={c.id} 
            onClick={() => click(c.id)} 
            className={`w-16 h-20 md:w-24 md:h-32 text-4xl rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all duration-300 transform active:scale-95 ${
              flipped.includes(c.id) || solved.includes(c.id) 
                ? 'bg-white rotate-y-180 border-2 border-pink-200' 
                : 'bg-pink-400 text-transparent hover:bg-pink-300'
            }`}
          >
            {(flipped.includes(c.id) || solved.includes(c.id)) ? c.emoji : '?'}
          </button>
        ))}
      </div>
      {solved.length === 8 && <div className="mt-8 px-6 py-3 bg-white rounded-full text-pink-600 font-bold shadow-lg animate-bounce">Thắng rồi! 🎉</div>}
    </GameWrapper>
  );
};

// 7. Fruit Picker
const GameFruitPicker = ({ onBack }: any) => {
  const fruits = ['🍎', '🍌', '🍇', '🍉'];
  const [target, setTarget] = useState('🍎');
  const [items, setItems] = useState<{id:number, val:string, visible:boolean}[]>([]);
  const [collected, setCollected] = useState(0);

  const init = () => {
    const t = fruits[Math.floor(Math.random() * fruits.length)];
    setTarget(t);
    setCollected(0);
    const newItems = Array.from({length: 12}).map((_, i) => ({
        id: i,
        val: fruits[Math.floor(Math.random() * fruits.length)],
        visible: true
    }));
    setItems(newItems);
    speak(`Bé hãy hái hết quả ${t}`);
  };
  useEffect(init, []);

  const pick = (id: number, val: string) => {
      if (val === target) {
          setItems(prev => prev.map(item => item.id === id ? {...item, visible: false} : item));
          setCollected(c => c + 1);
          speak('Ngone!');
      } else {
          speak('Không phải quả đó');
      }
  };

  const isAllCollected = items.filter(i => i.val === target && i.visible).length === 0;

  return (
    <GameWrapper title="Hái Quả" bg="bg-green-500" onBack={onBack} onReset={init} isWon={isAllCollected && collected > 0}>
      <h3 className="text-2xl font-bold mb-6 text-green-800 font-heading">Hái quả: <span className="text-5xl bg-white rounded-full px-2 shadow-sm animate-bounce inline-block">{target}</span></h3>
      <div className="flex flex-wrap justify-center gap-4 max-w-sm">
        {items.map((item) => (
          <button 
            key={item.id} 
            onClick={() => pick(item.id, item.val)} 
            className={`text-5xl transition-all duration-500 transform ${item.visible ? 'scale-100 hover:scale-125 active:scale-90 cursor-pointer' : 'scale-0 opacity-0'}`}
            disabled={!item.visible}
          >
            {item.val}
          </button>
        ))}
      </div>
      <div className="mt-8 font-bold text-green-700 bg-green-100 px-4 py-2 rounded-full shadow-inner">Đã hái: {collected}</div>
    </GameWrapper>
  );
};

// 8. Count Stars
const GameCount = ({ onBack }: any) => {
  const [num, setNum] = useState(3);
  const [isWon, setIsWon] = useState(false);
  
  const init = () => {
      setIsWon(false);
      setNum(Math.floor(Math.random() * 5) + 1);
      speak('Có bao nhiêu ngôi sao?');
  }
  useEffect(init, []);

  return (
    <GameWrapper title="Bé Tập Đếm" bg="bg-blue-500" onBack={onBack} onReset={init} isWon={isWon}>
      <h3 className="text-2xl font-bold mb-8 text-white font-heading">Có mấy ngôi sao?</h3>
      <div className="flex gap-3 mb-12 bg-white/20 p-6 rounded-3xl backdrop-blur-sm">
        {Array.from({length: num}).map((_, i) => (
            <Star key={i} size={56} className="text-yellow-300 fill-yellow-300 animate-float drop-shadow-md" style={{animationDelay: `${i*0.2}s`}} />
        ))}
      </div>
      <div className="flex gap-4">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => {
            if(n === num) { setIsWon(true); speak('Giỏi quá!'); setTimeout(init, 2000); } 
            else speak('Sai rồi');
          }} className="w-16 h-16 bg-white rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)] active:translate-y-[6px] active:shadow-none text-3xl font-bold text-blue-600 hover:bg-blue-50 hover:scale-110 transition-all">
            {n}
          </button>
        ))}
      </div>
    </GameWrapper>
  );
};

// 12. Big vs Small
const GameSize = ({ onBack }: any) => {
  const [askBig, setAskBig] = useState(true);
  const [isWon, setIsWon] = useState(false);

  const init = () => {
      setIsWon(false);
      const isBig = Math.random() > 0.5;
      setAskBig(isBig);
      speak(isBig ? 'Con nào TO hơn?' : 'Con nào NHỎ hơn?');
  }
  useEffect(init, []);
  
  return (
    <GameWrapper title="To và Nhỏ" bg="bg-teal-500" onBack={onBack} onReset={init} isWon={isWon}>
      <h3 className="text-3xl font-bold mb-12 text-white font-heading">Con nào {askBig ? 'TO' : 'NHỎ'} hơn?</h3>
      <div className="flex items-end justify-center gap-16">
        <button onClick={() => !askBig ? (setIsWon(true), speak('Đúng'), setTimeout(init,1500)) : speak('Sai')} className="text-5xl bg-white p-4 rounded-3xl shadow-lg hover:scale-110 active:scale-90 transition-transform transform rotate-[-10deg]">🦁</button>
        <button onClick={() => askBig ? (setIsWon(true), speak('Đúng'), setTimeout(init,1500)) : speak('Sai')} className="text-9xl bg-white p-6 rounded-3xl shadow-lg hover:scale-110 active:scale-90 transition-transform transform rotate-[10deg]">🦁</button>
      </div>
    </GameWrapper>
  );
};

// 13. Shadow Match
const GameShadow = ({ onBack }: any) => {
  const animals = [
      { i: '🦒', name: 'Hươu' }, 
      { i: '🐘', name: 'Voi' }, 
      { i: '🦓', name: 'Ngựa' },
      { i: '🐇', name: 'Thỏ' }
  ];
  const [target, setTarget] = useState(animals[0]);
  const [options, setOptions] = useState(animals);
  const [isWon, setIsWon] = useState(false);

  const init = () => {
      setIsWon(false);
      const t = animals[Math.floor(Math.random() * animals.length)];
      setTarget(t);
      setOptions([...animals].sort(() => Math.random() - 0.5));
      speak('Tìm bóng của bạn này');
  };
  useEffect(init, []);
  
  return (
    <GameWrapper title="Tìm Bóng" bg="bg-gray-600" onBack={onBack} onReset={init} isWon={isWon}>
      <div className="flex flex-col items-center gap-10">
        <div className="text-9xl grayscale brightness-0 opacity-40 animate-pulse cursor-pointer transition-transform hover:scale-110" onClick={() => speak(target.name)}>{target.i}</div>
        <div className="flex gap-6">
          {options.map((it, idx) => (
            <button key={idx} onClick={() => {
                if(it.i === target.i) { setIsWon(true); speak('Chính xác'); setTimeout(init, 1500); }
                else speak('Sai rồi');
            }} className="text-6xl bg-white p-4 rounded-2xl shadow-[0_8px_0_#cbd5e1] active:shadow-none active:translate-y-[8px] hover:scale-110 transition-all">
              {it.i}
            </button>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};

// 15. Quiz
const GameQuiz = ({ onBack }: any) => {
  const questions = [
      { t: 'Đây là con Mèo?', i: '🐱', a: true },
      { t: 'Đây là con Chó?', i: '🐱', a: false },
      { t: 'Quả Táo màu đỏ?', i: '🍎', a: true },
      { t: 'Quả Chuối màu xanh?', i: '🍌', a: false },
      { t: 'Máy bay bay trên trời?', i: '✈️', a: true }
  ];
  const [q, setQ] = useState(questions[0]);
  const [isWon, setIsWon] = useState(false);
  
  const init = () => {
      setIsWon(false);
      const nextQ = questions[Math.floor(Math.random() * questions.length)];
      setQ(nextQ);
      speak(nextQ.t);
  };
  useEffect(init, []);

  return (
    <GameWrapper title="Đố Vui" bg="bg-red-500" onBack={onBack} onReset={init} isWon={isWon}>
      <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center mb-10 w-72 border-8 border-red-200 animate-pop-in">
        <div className="text-9xl mb-6 animate-bounce">{q.i}</div>
        <h3 className="text-2xl font-bold text-red-600 font-heading leading-tight">{q.t}</h3>
      </div>
      <div className="flex gap-10">
        <button onClick={() => q.a ? (setIsWon(true), speak('Đúng rồi'), setTimeout(init,1500)) : speak('Sai rồi')} className="bg-green-500 text-white p-6 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform border-4 border-white"><Check size={48} strokeWidth={4}/></button>
        <button onClick={() => !q.a ? (setIsWon(true), speak('Đúng rồi'), setTimeout(init,1500)) : speak('Sai rồi')} className="bg-red-600 text-white p-6 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-transform border-4 border-white"><X size={48} strokeWidth={4}/></button>
      </div>
    </GameWrapper>
  );
};

// Placeholder for simpler games (reusing logic)
const GamePlaceholder = ({onBack, title}: any) => (
    <GameWrapper title={title} bg="bg-gray-400" onBack={onBack} onReset={() => {}}>
        <div className="text-center text-white font-bold text-xl animate-pulse">Đang cập nhật...</div>
    </GameWrapper>
);

// ================== MAIN HUB ==================

const GAMES_LIST: GameMeta[] = [
  { id: '1', title: 'Màu Sắc', desc: 'Học màu', icon: Palette, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: '2', title: 'Tiếng Kêu', desc: 'Động vật', icon: Music, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: '3', title: 'Đếm Số', desc: 'Toán học', icon: Hash, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { id: '4', title: 'Hình Học', desc: 'Nhận biết', icon: Shapes, color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: '5', title: 'Lật Hình', desc: 'Trí nhớ', icon: Brain, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: '7', title: 'Hái Quả', desc: 'Phản xạ', icon: Apple, color: 'text-green-600', bg: 'bg-green-100' },
  { id: '8', title: 'Đếm Sao', desc: 'Đếm số', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: '12', title: 'To Nhỏ', desc: 'So sánh', icon: Maximize, color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: '13', title: 'Tìm Bóng', desc: 'Tư duy', icon: Sun, color: 'text-gray-600', bg: 'bg-gray-200' },
  { id: '15', title: 'Đố Vui', desc: 'Kiến thức', icon: HelpCircle, color: 'text-red-600', bg: 'bg-red-100' },
];

const KidsGamesHub: React.FC = () => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const renderGame = () => {
    switch (activeGameId) {
      case '1': return <GameColorMatch onBack={() => setActiveGameId(null)} />;
      case '2': return <GameAnimalSounds onBack={() => setActiveGameId(null)} />;
      case '3': return <GameNumbers onBack={() => setActiveGameId(null)} />;
      case '4': return <GameShapes onBack={() => setActiveGameId(null)} />;
      case '5': return <GameMemory onBack={() => setActiveGameId(null)} />;
      case '7': return <GameFruitPicker onBack={() => setActiveGameId(null)} />;
      case '8': return <GameCount onBack={() => setActiveGameId(null)} />;
      case '12': return <GameSize onBack={() => setActiveGameId(null)} />;
      case '13': return <GameShadow onBack={() => setActiveGameId(null)} />;
      case '15': return <GameQuiz onBack={() => setActiveGameId(null)} />;
      default: return <GamePlaceholder title="Game Mới" onBack={() => setActiveGameId(null)} />;
    }
  };

  if (activeGameId) return renderGame();

  return (
    <div className="w-full pb-24 animate-fade-in font-heading bg-[#fdfbf7]">
      {/* Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden text-center mx-4 mt-4 transition-transform hover:scale-[1.02] duration-500">
        <div className="relative z-10">
          <Ghost size={50} className="mx-auto mb-2 animate-float drop-shadow-md" />
          <h1 className="text-3xl font-bold mb-1 drop-shadow-md">Khu Vui Chơi Của Bé</h1>
          <p className="font-medium text-sm opacity-95">Vừa học vừa chơi, phát triển tư duy</p>
        </div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-300/30 rounded-full blur-xl"></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 max-w-5xl mx-auto">
        {GAMES_LIST.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGameId(g.id)}
            className={`${g.bg} rounded-3xl p-4 shadow-[0_6px_0_rgba(0,0,0,0.05)] hover:shadow-none hover:translate-y-[6px] active:scale-95 transition-all flex flex-col items-center text-center border-2 border-white group relative overflow-hidden`}
          >
            <div className={`bg-white w-14 h-14 rounded-2xl flex items-center justify-center ${g.color} mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <g.icon size={28} strokeWidth={2.5} />
            </div>
            <h3 className={`font-bold text-gray-800 text-base mb-1 group-hover:${g.color} transition-colors`}>{g.title}</h3>
            <p className="text-xs text-gray-500 font-sans">{g.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KidsGamesHub;
