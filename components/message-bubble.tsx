'use client';

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName: string;
  timestamp: string;
}

export function MessageBubble({ content, isOwn, senderName, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-violet-600 text-white rounded-br-md'
              : 'bg-white/10 text-white rounded-bl-md'
          }`}
        >
          <p className="text-sm">{content}</p>
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-white/30">{senderName}</span>
          <span className="text-xs text-white/20">
            {new Date(timestamp).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
