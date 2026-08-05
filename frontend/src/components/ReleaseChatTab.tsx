import React, { useEffect, useState, useRef, useCallback } from 'react';
import api, { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  X,
  Loader2,
  User,
  Truck,
  ArrowDown
} from 'lucide-react';

interface ReleaseChatTabProps {
  carReleaseId: number;
  driverName?: string;
  carReleaseNo?: string;
}

interface ChatMessage {
  chat_id: number;
  car_release_id: number;
  user_id: number;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  image_url?: string;
  created_at: string;
}

export const ReleaseChatTab: React.FC<ReleaseChatTabProps> = ({
  carReleaseId,
  driverName,
  carReleaseNo
}) => {
  const { user } = useAuth();
  const currentUserId = Number(user?.user_id || 0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUserScrolledUpRef = useRef<boolean>(false);
  const initialScrolledRef = useRef<boolean>(false);

  const scrollToBottom = useCallback((force = false) => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        if (force || !isUserScrolledUpRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }
    });
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Check if user is more than 80px away from bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    isUserScrolledUpRef.current = isScrolledUp;
    setIsUserScrolledUp(isScrolledUp);
  };

  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!carReleaseId) return;
    try {
      if (isInitial) setLoading(true);
      const res = await api.get(`/car-release/${carReleaseId}/chat`);
      if (res.data.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [carReleaseId]);

  useEffect(() => {
    fetchMessages(true);
    // Polling every 3 seconds for live chat
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Initial load scroll to bottom
  useEffect(() => {
    if (!loading && messages.length > 0 && !initialScrolledRef.current) {
      initialScrolledRef.current = true;
      scrollToBottom(true);
      const t1 = setTimeout(() => scrollToBottom(true), 100);
      const t2 = setTimeout(() => scrollToBottom(true), 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [loading, messages.length, scrollToBottom]);

  // Handle subsequent message updates (only scroll if user is NOT scrolled up reading past history)
  useEffect(() => {
    if (initialScrolledRef.current && !isUserScrolledUpRef.current) {
      scrollToBottom(false);
    }
  }, [messages, scrollToBottom]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || sending) return;

    const msgToSend = inputMessage.trim();
    const imgToSend = selectedImage;

    setInputMessage('');
    setSelectedImage(null);
    setSending(true);

    try {
      const res = await api.post(`/car-release/${carReleaseId}/chat`, {
        message: msgToSend,
        image: imgToSend
      });

      if (res.data.success && res.data.chat) {
        // User explicitly sent a message -> Reset scroll lock & force scroll to bottom
        isUserScrolledUpRef.current = false;
        setIsUserScrolledUp(false);

        setMessages((prev) => {
          if (prev.some((m) => m.chat_id === res.data.chat.chat_id)) return prev;
          return [...prev, res.data.chat];
        });

        scrollToBottom(true);
        fetchMessages(false);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      setInputMessage(msgToSend);
      setSelectedImage(imgToSend);
    } finally {
      setSending(false);
    }
  };

  const handleQuickTemplate = (text: string) => {
    setInputMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleJumpToBottom = () => {
    isUserScrolledUpRef.current = false;
    setIsUserScrolledUp(false);
    scrollToBottom(true);
  };

  const quickTemplates = [
    'กำลังเดินทางไปร้านค้า',
    'ถึงร้านค้าแล้ว',
    'ติดจราจร / รถติด',
    'ส่งสินค้าเรียบร้อย',
    'ติดต่อลูกค้าไม่ได้'
  ];

  return (
    <div className="flex flex-col h-[620px] max-h-[80vh] bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden font-sans text-xs relative">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>แชทสื่อสารระหว่างปล่อยรถ</span>
              <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {carReleaseNo || `#${carReleaseId}`}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>คนขับ: <strong>{driverName || 'ไม่ระบุ'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reply Template Pills */}
      <div className="bg-white/80 border-b border-slate-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] text-slate-400 font-semibold shrink-0 flex items-center gap-1">
          ข้อความด่วน:
        </span>
        {quickTemplates.map((tmp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickTemplate(tmp)}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-medium border border-slate-200/80 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {tmp}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>กำลังโหลดข้อความ...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-600">ยังไม่มีข้อความสนทนา</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              เริ่มต้นส่งข้อความเพื่อแจ้งเตือนพนักงานขับรถหรือสอบถามสถานะระหว่างการปล่อยรถ
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = Number(msg.user_id) === Number(currentUserId);
            return (
              <div
                key={msg.chat_id}
                className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-slate-600 font-bold text-[10px] shadow-2xs">
                  {msg.sender_avatar ? (
                    <img src={getImageUrl(msg.sender_avatar)} alt={msg.sender_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{msg.sender_name ? msg.sender_name.substring(0, 1).toUpperCase() : <User className="w-3 h-3" />}</span>
                  )}
                </div>

                {/* Bubble Container */}
                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                  {/* Sender Name & Time */}
                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-semibold text-slate-700">{isMe ? 'คุณ' : msg.sender_name}</span>
                    <span>•</span>
                    <span>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  {/* Message Body Bubble */}
                  <div
                    className={`p-2.5 rounded-xl text-xs leading-relaxed shadow-2xs break-words ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    {/* Attached Image if present */}
                    {msg.image_url && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-black/10 max-w-xs">
                        <img
                          src={getImageUrl(msg.image_url)}
                          alt="Attached"
                          className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onLoad={() => {
                            if (!isUserScrolledUpRef.current) scrollToBottom(false);
                          }}
                          onClick={() => window.open(getImageUrl(msg.image_url), '_blank')}
                        />
                      </div>
                    )}
                    {msg.message && <p>{msg.message}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Jump to Bottom Button if user scrolled up */}
      {isUserScrolledUp && (
        <button
          type="button"
          onClick={handleJumpToBottom}
          className="absolute bottom-16 right-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5 transition-all animate-bounce z-10"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>เลื่อนลงล่างสุด</span>
        </button>
      )}

      {/* Image Preview before send */}
      {selectedImage && (
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={selectedImage} alt="Preview" className="w-10 h-10 object-cover rounded border border-slate-300" />
            <span className="text-[11px] text-slate-600 font-medium">รูปภาพที่แนบสำหรับส่ง</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Form */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2 shadow-sm">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          title="แนบรูปภาพ"
        >
          <ImageIcon className="w-4 h-4 text-slate-600" />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="พิมพ์ข้อความแชทเพื่อสื่อสาร..."
          className="flex-1 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
        />

        <button
          type="submit"
          disabled={(!inputMessage.trim() && !selectedImage) || sending}
          className={`p-2 rounded-lg font-bold transition-all flex items-center justify-center ${
            (!inputMessage.trim() && !selectedImage) || sending
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs hover:scale-105 active:scale-95'
          }`}
          title="ส่งข้อความ"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default ReleaseChatTab;
