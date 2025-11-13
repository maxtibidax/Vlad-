import React, { useState, useEffect, useCallback, useRef } from 'react';
import ItemButton from './components/NumberButton';
import { Sparkles, Megaphone, ArrowLeftCircle, ALargeSmall, SigmaSquare, Music, PartyPopper } from 'lucide-react';

type GameMode = 'numbers' | 'letters';

// --- Menu Component ---
const MenuScreen: React.FC<{ onSelectMode: (mode: GameMode) => void; }> = ({ onSelectMode }) => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-sky-200 to-indigo-300 flex flex-col justify-center items-center p-4 select-none">
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-700 mb-2">Изучаем с Владом</h1>
                <p className="text-lg text-slate-600">Выбери, во что будем играть</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                <button
                    onClick={() => onSelectMode('numbers')}
                    className="aspect-[4/3] bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-indigo-600 shadow-lg transition-transform transform active:scale-95 hover:scale-105"
                >
                    <SigmaSquare className="h-16 w-16" strokeWidth={2.5}/>
                    <span className="text-2xl font-black">Цифры</span>
                </button>
                <button
                    onClick={() => onSelectMode('letters')}
                    className="aspect-[4/3] bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-center items-center gap-4 text-teal-600 shadow-lg transition-transform transform active:scale-95 hover:scale-105"
                >
                    <ALargeSmall className="h-16 w-16" strokeWidth={2.5}/>
                    <span className="text-2xl font-black">Буквы</span>
                </button>
            </div>
        </div>
    );
};

// --- Party Component ---
const PartyScreen: React.FC<{ onEndParty: () => void; }> = ({ onEndParty }) => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 flex flex-col justify-center items-center p-4 select-none overflow-hidden relative animate-party-bg">
            <div className="text-center">
                 <PartyPopper className="h-24 w-24 text-white mx-auto animate-tada" style={{ animationIterationCount: 'infinite', animationDuration: '2s' }}/>
                <h1 className="text-6xl sm:text-8xl font-black text-white text-center mt-4" style={{textShadow: '0 0 20px rgba(0,0,0,0.2)'}}>
                    ВЕЧЕРИНКА!
                </h1>
                <p className="text-white text-2xl mt-4 font-bold">Ты большой молодец!</p>
            </div>
            <button
                onClick={onEndParty}
                className="mt-12 flex items-center gap-3 bg-white/80 backdrop-blur-sm text-indigo-600 font-bold py-4 px-8 rounded-full shadow-lg transition-transform transform active:scale-95 hover:scale-105"
            >
                <Music className="h-6 w-6" />
                Закончить вечеринку
            </button>
             <style>{`
                @keyframes party-bg {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-party-bg {
                    background-size: 200% 200%;
                    animation: party-bg 10s ease infinite;
                }
                 @keyframes tada {
                    from { transform: scale3d(1, 1, 1); }
                    10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); }
                    30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
                    40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
                    to { transform: scale3d(1, 1, 1); }
                }
                .animate-tada {
                    animation-name: tada;
                }
            `}</style>
        </div>
    );
};


// --- Game Component ---
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const RUSSIAN_ALPHABET = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];

const positiveFeedback = [
    'Молодец, Влад!', 'Отлично!', 'Правильно!', 'Умница!', 'Так держать!', 'Великолепно!', 'Супер!'
];

const letterPronunciation: { [key: string]: string } = {
    'К': 'Ка',
    'О': 'Оо',
    'Ж': 'жэ',
    'В': 'вэ',
};

const getSpokenText = (item: string | number): string => {
    if (typeof item === 'string' && letterPronunciation[item]) {
        return letterPronunciation[item];
    }
    return item.toString();
};


// FIX: Converted from a generic arrow function to a standard function declaration
// to avoid TSX parsing ambiguity which caused a cascade of compilation errors.
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

interface GameScreenProps {
    mode: GameMode;
    onBackToMenu: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ mode, onBackToMenu }) => {
    const [items, setItems] = useState<(number | string)[]>([]);
    const [targetItem, setTargetItem] = useState<number | string | null>(null);
    const [isWrong, setIsWrong] = useState<number | string | null>(null);
    const [isCorrect, setIsCorrect] = useState<number | string | null>(null);
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [isPartyTime, setIsPartyTime] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const gameConfig = React.useMemo(() => ({
        numbers: {
            source: NUMBERS,
            prompt: 'цифру'
        },
        letters: {
            source: RUSSIAN_ALPHABET,
            prompt: 'букву'
        }
    }), []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const russianVoice = voices.find(voice => voice.lang === 'ru-RU');
        if (russianVoice) utterance.voice = russianVoice;
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        if (onEnd) utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
    }, []);

    const startNewRound = useCallback(() => {
        setIsCorrect(null);
        const { source, prompt } = gameConfig[mode];
        // FIX: The `source` variable is a union of array types (`number[] | string[]`). Passing it directly
        // to the generic `shuffleArray` causes TypeScript to infer the generic type as `unknown`.
        // Spreading the `source` into a new array converts its type to an array of a union type
        // (`(string | number)[]`), allowing for correct type inference.
        const shuffledSource = shuffleArray([...source]);
        const newItems = shuffledSource.slice(0, 9);
        setItems(newItems);
        const newTarget = newItems[Math.floor(Math.random() * newItems.length)];
        // FIX: The type of `newTarget` from array access can be undefined. This is not a valid
        // argument for `setTargetItem` or `getSpokenText`. This check guards against that.
        if (newTarget !== undefined) {
            setTargetItem(newTarget);
            const pronunciation = getSpokenText(newTarget);
            speak(`Влад, найди ${prompt} ${pronunciation}`);
        }
    }, [mode, speak, gameConfig]);

    useEffect(() => {
        const handleVoicesChanged = () => {
            startNewRound();
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        if (window.speechSynthesis.getVoices().length > 0) {
            startNewRound();
        }

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
            window.speechSynthesis.cancel();
        };
    }, [startNewRound]);

    const handleItemClick = (clickedItem: number | string) => {
        if (isCorrect !== null || isPartyTime) return;

        if (clickedItem === targetItem) {
            setIsCorrect(clickedItem);
            const newCount = correctAnswersCount + 1;
            
            if (newCount >= 2) {
                 const feedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
                 speak(feedback, () => {
                    setTimeout(() => {
                        speak("конец урока, а теперь вечеринка", () => {
                            setIsPartyTime(true);
                            setCorrectAnswersCount(0);
                            setIsCorrect(null);
                        });
                    }, 700);
                 });
            } else {
                setCorrectAnswersCount(newCount);
                const feedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
                speak(feedback, () => {
                    setTimeout(() => {
                        startNewRound();
                    }, 500);
                });
            }
        } else {
            setIsWrong(clickedItem);
            speak('Попробуй ещё');
            setTimeout(() => {
                setIsWrong(null);
            }, 500);
        }
    };
    
    useEffect(() => {
        if (isPartyTime) {
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current?.pause();
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
        }
    }, [isPartyTime]);

    const handleEndParty = () => {
        setIsPartyTime(false); // This will stop the music via useEffect
        onBackToMenu();
    };

    const handleBackToMenuClick = () => {
        setCorrectAnswersCount(0); // Reset count on manual exit
        onBackToMenu();
    };


    const repeatPrompt = () => {
        if (targetItem) {
            const { prompt } = gameConfig[mode];
            const pronunciation = getSpokenText(targetItem);
            speak(`Найди ${prompt} ${pronunciation}`);
        }
    };
    
    return (
        <>
            <audio ref={audioRef} src="./music.mp3" loop />
            {isPartyTime ? (
                <PartyScreen onEndParty={handleEndParty} />
            ) : (
                <div className="min-h-screen w-full bg-gradient-to-br from-sky-200 to-indigo-300 flex flex-col justify-center items-center p-4 select-none touch-manipulation">
                     <button 
                        onClick={handleBackToMenuClick}
                        className="absolute top-4 left-4 flex items-center gap-2 bg-white/60 backdrop-blur-sm text-slate-600 font-bold py-2 px-4 rounded-full shadow-md transition-transform transform active:scale-95 hover:bg-white z-10"
                        aria-label="Вернуться в меню"
                    >
                        <ArrowLeftCircle className="h-6 w-6" />
                        Меню
                    </button>
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
                                    `Найди ${gameConfig[mode].prompt}: ${targetItem ?? ''}`
                                )}
                            </h1>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            {items.map((item, index) => (
                                <ItemButton
                                    key={typeof item === 'number' ? item : `${item}-${index}`}
                                    item={item}
                                    onClick={() => handleItemClick(item)}
                                    isCorrect={isCorrect === item}
                                    isWrong={isWrong === item}
                                    index={index}
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
            )}
        </>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
    const [gameMode, setGameMode] = useState<GameMode | null>(null);

    if (!gameMode) {
        return <MenuScreen onSelectMode={setGameMode} />;
    }

    return <GameScreen mode={gameMode} onBackToMenu={() => setGameMode(null)} />;
};

export default App;