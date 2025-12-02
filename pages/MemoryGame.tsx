import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { RefreshCw } from 'lucide-react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    shuffleCards();
  }, []);

  const shuffleCards = () => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledEmojis);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isMatched || cards[id].isFlipped) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (flipped: number[], currentCards: Card[]) => {
    const [first, second] = flipped;
    if (currentCards[first].emoji === currentCards[second].emoji) {
      currentCards[first].isMatched = true;
      currentCards[second].isMatched = true;
      setCards([...currentCards]);
      setFlippedCards([]);
      
      if (currentCards.every(card => card.isMatched)) {
        setIsWon(true);
      }
    } else {
      setTimeout(() => {
        const resetCards = [...currentCards];
        resetCards[first].isFlipped = false;
        resetCards[second].isFlipped = false;
        setCards(resetCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md text-center max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-600">Lật Hình Ghi Nhớ</h2>
          <p className="text-gray-500">Số lượt đi: {moves}</p>
        </div>
        <Button onClick={shuffleCards} variant="outline" size="sm">
          <RefreshCw size={18} className="mr-2" /> Chơi lại
        </Button>
      </div>

      {isWon && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl animate-bounce">
          🎉 Chúc mừng bé! Bé đã hoàn thành trò chơi!
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              aspect-square rounded-xl cursor-pointer flex items-center justify-center text-4xl
              transition-all duration-300 transform
              ${card.isFlipped || card.isMatched ? 'bg-white rotate-0 border-4 border-primary-200 shadow-inner' : 'bg-primary-400 rotate-y-180 hover:bg-primary-500 shadow-lg'}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;