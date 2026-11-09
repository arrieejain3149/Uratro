interface NabilButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  theme?: 'white' | 'black';
}

export default function NabilButton({
  text,
  onClick,
  className = '',
  theme = 'black'
}: NabilButtonProps) {
  return (
    <div className={`animation-container ${theme === 'black' ? 'black' : ''} ${className}`}>
      <button type="button" onClick={onClick} className="btn l1-bold font-mono">
        <div className="btn-decor">
          <svg className="icon" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.78109 5.33327L5.20509 1.75726L6.14789 0.814453L11.3334 5.99993L6.14789 11.1853L5.20509 10.2425L8.78109 6.6666H0.666687V5.33327H8.78109Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="btn-wrap">
          <div className="btn-text">{text}</div>
          <div className="btn-text">{text}</div>
        </div>
      </button>
    </div>
  );
}
