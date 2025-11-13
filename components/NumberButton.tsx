
import React from 'react';

interface ItemButtonProps {
    item: number | string;
    onClick: () => void;
    isCorrect: boolean;
    isWrong: boolean;
    index: number;
}

const colors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400',
    'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
    'bg-indigo-400', 'bg-teal-400', 'bg-orange-400'
];

const ItemButton: React.FC<ItemButtonProps> = ({ item, onClick, isCorrect, isWrong, index }) => {
    const baseColor = colors[index % colors.length];
    
    const animationClass = isWrong ? 'animate-shake' : '';
    
    let stateClasses = `${baseColor} hover:brightness-110 active:scale-95`;
    if (isCorrect) {
        stateClasses = 'bg-green-500 scale-110 animate-tada';
    } else if (isWrong) {
        stateClasses = 'bg-red-500';
    }

    return (
        <button
            onClick={onClick}
            className={`
                aspect-square w-full rounded-2xl 
                flex items-center justify-center
                font-black text-5xl sm:text-6xl text-white 
                shadow-lg transition-all duration-300 ease-in-out
                transform focus:outline-none 
                ${stateClasses} ${animationClass}
            `}
            style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                animation: isWrong ? 'shake 0.5s' : (isCorrect ? 'tada 1s' : 'none')
            }}
        >
            {item}
            <style>
            {`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                @keyframes tada {
                    from { transform: scale3d(1, 1, 1); }
                    10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); }
                    30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
                    40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
                    to { transform: scale3d(1, 1, 1); }
                }
            `}
            </style>
        </button>
    );
};

export default ItemButton;
