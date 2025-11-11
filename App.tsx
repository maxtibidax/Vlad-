
import React, { useState, useEffect, useCallback } from 'react';
import NumberButton from './components/NumberButton';
import { Sparkles, Megaphone } from 'lucide-react';

const initialNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const positiveFeedback = [
    'Молодец, Влад!',
    'Отлично!',
    'Правильно!',
    'Умница!',
    'Так держать!',
    'Великолепно!',
    'Супер!',
];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const App: React.FC = () => {
    const [numbers, setNumbers] = useState<number[]>(() => shuffleArray(initialNumbers));
    const [targetNumber, setTargetNumber] = useState<number | null>(null);
    const [isWrong, setIsWrong] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<number | null>(null);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        // Cancel any ongoing speech to prevent overlap
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a Russian voice
        const voices = window.speechSynthesis.getVoices();
        const russianVoice = voices.find(voice => voice.lang === 'ru-RU');
        if (russianVoice) {
            utterance.voice = russianVoice;
        }
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1.2;

        if (onEnd) {
            utterance.onend = onEnd;
        }
        
        window.speechSynthesis.speak(utterance);
    }, []);

    const startNewRound = useCallback(() => {
        setIsCorrect(null);
        const shuffled = shuffleArray(initialNumbers);
        setNumbers(shuffled);
        const newTarget = shuffled[Math.floor(Math.random() * shuffled.length)];
        setTargetNumber(newTarget);
        speak(`Влад, найди цифру ${newTarget}`);
    }, [speak]);

    useEffect(() => {
        // The voices list is loaded asynchronously.
        const handleVoicesChanged = () => {
            startNewRound();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Initial call if voices are already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
            startNewRound();
        }

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startNewRound]);

    const handleNumberClick = (clickedNumber: number) => {
        if (isCorrect !== null) return; // Prevent clicking during success animation

        if (clickedNumber === targetNumber) {
            setIsCorrect(clickedNumber);
            const feedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
            speak(feedback, () => {
                setTimeout(() => {
                    startNewRound();
                }, 500);
            });
        } else {
            setIsWrong(clickedNumber);
            speak('Попробуй ещё');
            setTimeout(() => {
                setIsWrong(null);
            }, 500);
        }
    };

    const repeatPrompt = () => {
        if (targetNumber) {
            speak(`Найди цифру ${targetNumber}`);
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-sky-200 to-indigo-300 flex flex-col justify-center items-center p-4 select-none touch-manipulation">
            <div className="w-full max-w-sm md:max-w-md mx-auto">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-700">
                        {isCorrect !== null ? (
                            <span className="flex items-center justify-center text-green-600">
                                <Sparkles className="h-8 w-8 mr-2 animate-ping absolute opacity-75" />
                                <Sparkles className="h-8 w-8 mr-2" />
                                Молодец!
                            </span>
                        ) : (
                            `Найди цифру: ${targetNumber}`
                        )}
                    </h1>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {numbers.map((num) => (
                        <NumberButton
                            key={num}
                            number={num}
                            onClick={() => handleNumberClick(num)}
                            isCorrect={isCorrect === num}
                            isWrong={isWrong === num}
                        />
                    ))}
                </div>
                 <div className="mt-6 flex justify-center">
                    <button 
                        onClick={repeatPrompt}
                        className="flex items-center gap-2 bg-white/60 backdrop-blur-sm text-indigo-600 font-bold py-3 px-6 rounded-full shadow-md transition-transform transform active:scale-95 hover:bg-white"
                    >
                        <Megaphone className="h-6 w-6" />
                        Повтори
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
