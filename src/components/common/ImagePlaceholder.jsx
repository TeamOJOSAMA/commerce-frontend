// 실제 상품/배너 이미지가 아직 없을 때 쓰는 골격(스켈레톤) 이미지 자리.
export default function ImagePlaceholder({ className = '' }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-2xl bg-white/60 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-gray-300" fill="none">
        <rect x="4" y="4" width="56" height="56" rx="8" stroke="currentColor" strokeWidth="3" />
        <circle cx="22" cy="24" r="6" fill="currentColor" />
        <path
          d="M8 46L23 32L34 42L44 30L57 46"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
