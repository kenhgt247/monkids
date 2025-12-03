
import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { RefreshCw, ArrowLeft, Star, Music, Check, X, Gamepad2, Trophy, Volume2 } from 'lucide-react';
import { Game } from '../types';
import { mockGames } from '../services/mockData';
import MemoryGame from './MemoryGame';

// --- DATA CHO CÁC MINI GAMES ---

// 2. Học Màu Sắc
const COLORS_DATA = [
  { name: 'Màu Đỏ', code: 'bg-red-500', id: 'red' },
  { name: 'Màu Xanh Dương', code: 'bg-blue-500', id: 'blue' },
  { name: 'Màu Vàng', code: 'bg-yellow-400', id: 'yellow' },
  { name: 'Màu Xanh Lá', code: 'bg-green-500', id: 'green' },
  { name: 'Màu Tím', code: 'bg-purple-500', id: 'purple' },
];

// 3. Tiếng Anh Hoa Quả
const FRUITS_DATA = [
  { word: 'Apple', image: '🍎', vi: 'Quả Táo' },
  { word: 'Banana', image: '🍌', vi: 'Quả Chuối' },
  { word: 'Grape', image: '🍇', vi: 'Quả Nho' },
  { word: 'Orange', image: '🍊', vi: 'Quả Cam' },
  { word: 'Watermelon', image: '🍉', vi: 'Dưa Hấu' },
];

// 4. Bé Tập Đếm
const COUNTING_DATA = [
  { count: 3, icon: '🐱', options: [2, 3, 5] },
  { count: 5, icon: '⭐', options: [4, 5, 1] },
  { count: 1, icon: '🐘', options: [1, 2, 3] },
  { count: 4, icon: '🚗', options: [3, 4, 6] },
  { count: 2, icon: '🐶', options: [2, 5, 8] },
];

// 5. Ai Kêu Thế Nhỉ
const ANIMAL_SOUNDS = [
  { name: 'Con Mèo', sound: 'Meo meo', icon: '🐱', options: ['🐱', '🐶', '🐮'] },
  { name: 'Con Chó', sound: 'Gâu gâu', icon: '🐶', options: ['🐷', '🐶', '🐔'] },
  { name: 'Con Bò', sound: 'Mòooo', icon: '🐮', options: ['🐮', '🐯', '🐸'] },
  { name: 'Con Gà', sound: 'Ò ó o', icon: '🐔', options: ['🦆', '🐔', '🦁'] },
];

// 6. Tiếng Việt ABC
const ALPHABET_VN = [
  'A', 'Ă', 'Â', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 'G', 'H', 'I', 'K', 'L', 'M'
];

// 8. Piano
const PIANO_KEYS = [
  { note: 'Do', color: 'bg-red-500' },
  { note: 'Re', color: 'bg-orange-500' },
  { note: 'Mi', color: 'bg-yellow-400' },
  { note: 'Fa', color: 'bg-green-500' },
  { note: 'Sol', color: 'bg-blue-500' },
  { note: 'La', color: 'bg-indigo-500' },
  { note: 'Si', color: 'bg-purple-500' },
];

// 9. Hình Học
const SHAPES_DATA = [
    { name: 'Hình Tròn', shapeClass: 'rounded-full bg-red-500', id: 'circle' },
    { name: 'Hình Vuông', shapeClass: 'rounded-none bg-blue-500', id: 'square' },
    { name: 'Tam Giác', shapeClass: 'w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[100px] border-b-green-500 bg-transparent rounded-none', id: 'triangle' }
];

interface KidsGamesHubProps {
  // 
}

const KidsGamesHub: React.FC<KidsGamesHubProps> = () => {
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  // Render Menu
  if (!activeGame) {
    return (
      <div className="w-full animate-fade-in pb-20">
        <div className="bg-gradient-to-r from-yellow-300 to-orange-400 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
                <h1 className="text-3xl font-bold font-heading mb-2">Sân Chơi Bé Yêu 🎪</h1>
                <p className="font-medium opacity-90">Vừa học vừa chơi, phát triển tư duy cho bé từ 2-6 tuổi.</p>
             </div>
             <Gamepad2 className="absolute -right-5 -bottom-5 text-white/20" size={150} />
             <div className="absolute top-5 right-20 w-10 h-10 bg-white/30 rounded-full animate-bounce"></div>
             <div className="absolute bottom-10 left-10 w-6 h-6 bg-yellow-200/40 rounded-full animate-ping"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockGames.map(game => (
            <div 
              key={game.id}
              onClick={() => setActiveGame(game)}
              className={`bg-white rounded-2xl p-4 shadow-sm border-2 border-transparent hover:border-primary-300 hover:shadow-md cursor-pointer transition-all group flex flex-col items-center text-center h-full ${game.color?.replace('bg-', 'hover:bg-opacity-20 ')}`}
            >
               <div className={`w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl shadow-sm ${game.color || 'bg-gray-100'}`}>
                   {/* Dùng Emoji làm icon tạm thời nếu ko load đc ảnh */}
                   <img src={game.thumbnail} alt={game.title} className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; }} />
                   <span className="absolute">🎮</span> 
               </div>
               <h3 className="font-bold text-gray-800 font-heading group-hover:text-primary-600 leading-tight mb-1">{game.title}</h3>
               <p className="text-xs text-gray-500 line-clamp-2">{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render Game Wrapper
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
        {/* Header */}
        <div className={`p-4 flex justify-between items-center text-white shadow-md ${activeGame.color?.split(' ')[0] || 'bg-primary-500'}`}>
            <div className="flex items-center">
                <button onClick={() => setActiveGame(null)} className="p-2 bg-white/20 rounded-full mr-3 hover:bg-white/30 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold font-heading">{activeGame.title}</h2>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <Star size={16} className="mr-1 text-yellow-300" fill="currentColor"/> Chơi nào!
            </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto flex items-center justify-center">
             {activeGame.id === 'game_memory' && <MemoryGame />}
             {activeGame.id === 'game_color' && <ColorGame />}
             {activeGame.id === 'game_english_fruit' && <EnglishFruitGame />}
             {activeGame.id === 'game_counting' && <CountingGame />}
             {activeGame.id === 'game_animal_sound' && <AnimalSoundGame />}
             {activeGame.id === 'game_vietnamese' && <VietnameseGame />}
             {activeGame.id === 'game_piano' && <PianoGame />}
             {activeGame.id === 'game_math' && <MathGame />}
             {activeGame.id === 'game_shapes' && <ShapesGame />}
             {activeGame.id === 'game_shadow' && <ShadowGame />}
        </div>
    </div>
  );
};

// --- MINI GAME COMPONENTS ---

const WinScreen = ({ onReset, message = "Hoan hô! Bé giỏi quá! 🎉" }: { onReset: () => void, message?: string }) => (
    <div className="text-center animate-bounce-in">
        <Trophy size={80} className="text-yellow-400 mx-auto mb-4" fill="currentColor"/>
        <h3 className="text-2xl font-bold text-green-600 mb-2 font-heading">{message}</h3>
        <Button onClick={onReset} className="mt-4">Chơi Lại Nhé</Button>
    </div>
);

const ColorGame = () => {
    const [target, setTarget] = useState(COLORS_DATA[0]);
    const [score, setScore] = useState(0);

    const checkColor = (color: typeof COLORS_DATA[0]) => {
        if (color.id === target.id) {
            setScore(s => s + 1);
            setTarget(COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)]);
        }
    };

    return (
        <div className="text-center w-full max-w-md">
            <h3 className="text-xl font-bold mb-8">Bé hãy chọn bóng: <span className={`px-3 py-1 rounded-lg text-white ${target.code}`}>{target.name}</span></h3>
            <div className="flex flex-wrap justify-center gap-6">
                {COLORS_DATA.map((c, i) => (
                    <button 
                        key={i} 
                        onClick={() => checkColor(c)}
                        className={`w-20 h-24 rounded-[50%] ${c.code} shadow-lg active:scale-90 transition-transform relative overflow-hidden`}
                    >
                         <div className="absolute top-4 right-4 w-4 h-4 bg-white/30 rounded-full"></div>
                    </button>
                ))}
            </div>
            <p className="mt-8 text-gray-500 font-bold">Điểm: {score}</p>
        </div>
    );
};

const EnglishFruitGame = () => {
    const [current, setCurrent] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const next = () => {
        setFlipped(false);
        setCurrent((prev) => (prev + 1) % FRUITS_DATA.length);
    };

    const item = FRUITS_DATA[current];

    return (
        <div className="flex flex-col items-center">
            <div 
                className={`w-64 h-80 bg-white rounded-3xl shadow-xl border-4 border-green-100 flex flex-col items-center justify-center cursor-pointer transition-all transform hover:scale-105 duration-300 ${flipped ? 'rotate-y-180' : ''}`}
                onClick={() => setFlipped(!flipped)}
            >
                <div className="text-9xl mb-4">{item.image}</div>
                {flipped ? (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-green-600 font-heading">{item.vi}</h2>
                        <p className="text-gray-400 mt-2">(Chạm để xem tiếng Anh)</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-orange-500 font-heading">{item.word}</h2>
                        <p className="text-gray-400 mt-2">(Chạm để xem nghĩa)</p>
                    </div>
                )}
            </div>
            <Button onClick={next} className="mt-8" size="lg">Quả Tiếp Theo <RefreshCw size={18} className="ml-2"/></Button>
        </div>
    );
};

const CountingGame = () => {
    const [round, setRound] = useState(0);
    const [isWon, setIsWon] = useState(false);
    
    const current = COUNTING_DATA[round % COUNTING_DATA.length];

    const check = (num: number) => {
        if (num === current.count) {
            if (round % COUNTING_DATA.length === COUNTING_DATA.length - 1) setIsWon(true);
            else setRound(r => r + 1);
        } else {
            alert("Chưa đúng rồi, bé đếm lại nhé!");
        }
    };

    if (isWon) return <WinScreen onReset={() => { setIsWon(false); setRound(0); }} />;

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-6">Có bao nhiêu {current.icon}?</h3>
            <div className="flex gap-4 justify-center mb-10 text-6xl animate-pulse">
                {Array.from({ length: current.count }).map((_, i) => (
                    <span key={i}>{current.icon}</span>
                ))}
            </div>
            <div className="flex gap-4 justify-center">
                {current.options.map(opt => (
                    <button 
                        key={opt} 
                        onClick={() => check(opt)}
                        className="w-20 h-20 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-3xl font-bold rounded-2xl shadow-sm border-b-4 border-yellow-300 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const AnimalSoundGame = () => {
    const [current, setCurrent] = useState(ANIMAL_SOUNDS[0]);
    const [isPlaying, setIsPlaying] = useState(false);

    const playSound = () => {
        setIsPlaying(true);
        // Trong thực tế sẽ dùng Audio(), ở đây giả lập bằng alert/text animation
        setTimeout(() => setIsPlaying(false), 1000);
    };

    const check = (icon: string) => {
        if (icon === current.icon) {
            alert("Đúng rồi! Giỏi quá!");
            const nextIdx = Math.floor(Math.random() * ANIMAL_SOUNDS.length);
            setCurrent(ANIMAL_SOUNDS[nextIdx]);
        }
    };

    return (
        <div className="text-center w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Ai kêu: "{current.sound}"?</h3>
            <button 
                onClick={playSound}
                className={`w-32 h-32 rounded-full bg-orange-100 text-orange-500 mx-auto mb-8 flex items-center justify-center border-4 border-orange-200 ${isPlaying ? 'scale-110' : ''} transition-transform`}
            >
                {isPlaying ? <Volume2 size={48} className="animate-ping"/> : <Music size={48} />}
            </button>
            <div className="flex justify-around">
                {current.options.map((opt, i) => (
                    <button key={i} onClick={() => check(opt)} className="text-6xl p-4 bg-white rounded-2xl shadow-sm hover:scale-110 transition-transform">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const VietnameseGame = () => {
    return (
        <div className="text-center">
             <h3 className="text-xl font-bold mb-6 text-purple-600">Bảng Chữ Cái Tiếng Việt</h3>
             <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                 {ALPHABET_VN.map(char => (
                     <button key={char} className="aspect-square bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-2xl rounded-xl shadow-sm border border-purple-100 flex items-center justify-center">
                         {char}
                     </button>
                 ))}
             </div>
        </div>
    );
};

const PianoGame = () => {
    const playNote = (note: string) => {
        // Visual feedback only for this demo
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-end h-64 bg-gray-800 p-4 rounded-xl shadow-2xl gap-2">
                {PIANO_KEYS.map((key) => (
                    <button 
                        key={key.note}
                        onClick={() => playNote(key.note)}
                        className={`w-12 h-full rounded-b-lg active:h-[95%] transition-all relative group bg-white hover:bg-gray-100`}
                    >
                        <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-xs ${key.color} text-white px-1 rounded`}>{key.note}</span>
                    </button>
                ))}
            </div>
            <p className="mt-4 text-gray-500">Bé hãy nhấn vào phím đàn nhé!</p>
        </div>
    );
};

const MathGame = () => {
    const [num1, setNum1] = useState(2);
    const [num2, setNum2] = useState(3);
    const [options, setOptions] = useState([5, 6, 7]);

    const generate = () => {
        const n1 = Math.floor(Math.random() * 5) + 1;
        const n2 = Math.floor(Math.random() * 5) + 1;
        const ans = n1 + n2;
        setNum1(n1); setNum2(n2);
        setOptions([ans, ans + 1, ans - 1].sort(() => Math.random() - 0.5));
    };

    const check = (ans: number) => {
        if (ans === num1 + num2) {
            alert("Chính xác!");
            generate();
        } else {
            alert("Sai rồi, thử lại nhé!");
        }
    };

    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-4 text-6xl font-bold text-teal-600 mb-10 font-heading">
                <span>{num1}</span>
                <span>+</span>
                <span>{num2}</span>
                <span>=</span>
                <span className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">?</span>
            </div>
            <div className="flex justify-center gap-6">
                {options.map(opt => (
                    <button key={opt} onClick={() => check(opt)} className="w-24 h-24 bg-teal-500 text-white rounded-full text-3xl font-bold shadow-lg hover:bg-teal-600 hover:scale-105 transition-all">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ShapesGame = () => {
    const [currentShape, setCurrentShape] = useState(SHAPES_DATA[0]);

    const check = (id: string) => {
        if(id === currentShape.id) {
            alert("Đúng rồi!");
            setCurrentShape(SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)]);
        }
    };

    return (
         <div className="text-center w-full max-w-md">
            <h3 className="text-xl font-bold mb-8">Đâu là: <span className="text-indigo-600">{currentShape.name}</span>?</h3>
            <div className="flex justify-around items-end h-32">
                {SHAPES_DATA.map(shape => (
                    <div key={shape.id} onClick={() => check(shape.id)} className="cursor-pointer hover:scale-110 transition-transform">
                        <div className={`w-20 h-20 ${shape.shapeClass}`}></div>
                    </div>
                ))}
            </div>
         </div>
    );
};

const ShadowGame = () => {
    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Tìm bóng cho quả táo</h3>
            <div className="flex justify-center gap-10 mb-10">
                <span className="text-8xl">🍎</span>
            </div>
            <div className="flex justify-center gap-6">
                <button className="text-8xl brightness-0 opacity-20 hover:opacity-40 transition-opacity">🍌</button>
                <button className="text-8xl brightness-0 opacity-20 hover:opacity-40 transition-opacity" onClick={() => alert("Đúng rồi!")}>🍎</button>
                <button className="text-8xl brightness-0 opacity-20 hover:opacity-40 transition-opacity">🍇</button>
            </div>
        </div>
    );
}

export default KidsGamesHub;
