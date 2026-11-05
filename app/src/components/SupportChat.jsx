// SupportChat — the live thread behind /chat-cs and the recovery form's
// "Minta Bantuan" sheet. Both read the account's thread from
// /api/support/chat/messages/ and send through /api/support/chat/send/;
// the SSE stream only triggers a re-read, so the bubbles always match REST.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api, errorText, session, SUPPORT_CHAT_STREAM } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { t } from '../lib/i18n.js';

const css = `
.support-chat *{
  box-sizing: border-box;
}
.support-chat p,
.support-chat h2{
  margin: 0;
}
.support-chat button{
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}
.support-chat input{
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  color: inherit;
  width: 100%;
}

/* full-page shell — /chat-cs */
.support-chat.is-page{
  height: 100cqh;
  max-height: 917px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #0c1a2d 0%, #13263d 38%, #0f2036 70%, #0a1626 100%);
  font-family: 'Inter', sans-serif;
}

/* bottom-sheet shell — opened over the recovery form */
.support-chat.is-sheet{
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: rgba(4, 9, 18, 0.85);
  font-family: 'Inter', sans-serif;
  animation: chat-sheet-fade 0.18s ease-out;
}
.support-chat.is-sheet .chat-bottom-sheet{
  position: relative;
  background: linear-gradient(180deg, #1d3350 0%, #14263d 100%);
  border-radius: 24px;
  box-shadow: 0px 24px 60px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  max-height: 82%;
  margin: 0 16px;
  overflow: hidden;
  animation: chat-sheet-up 0.22s ease-out;
}

/* header */
.support-chat .chat-header{
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.support-chat.is-page .chat-header{
  padding: 20px 16px 12px;
}
.support-chat.is-sheet .chat-header{
  padding: 14px 16px;
}
.support-chat .icon-btn{
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.support-chat .avatar-container{
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.support-chat .avatar{
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.support-chat .status-dot{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 11px;
  height: 11px;
  background-color: #3ecf8e;
  border: 2px solid #1d3350;
  border-radius: 50%;
}
.support-chat.is-page .status-dot{
  border-color: #0c1a2d;
}
.support-chat .status-dot.is-offline{
  background-color: #75879c;
}
.support-chat .header-info{
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.support-chat .chat-title{
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
}
.support-chat .chat-status{
  color: #8fc9ad;
  font-size: 12px;
}
.support-chat .chat-status.is-offline{
  color: #8597ab;
}
.support-chat .close-btn{
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* thread */
.support-chat .chat-messages{
  flex: 1 1 auto;
  min-height: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  scrollbar-width: none;
}
.support-chat.is-page .chat-messages{
  padding: 16px;
}
.support-chat .chat-messages::-webkit-scrollbar{
  display: none;
}
.support-chat .chat-state{
  margin: auto;
  padding: 20px 10px;
  color: #a9b7c8;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.support-chat .chat-retry{
  border-radius: 16px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #e6ecf3;
  font-size: 12px;
  font-weight: 600;
}
.support-chat .message{
  display: flex;
  flex-direction: column;
  max-width: 85%;
}
.support-chat .bot-message{
  align-self: flex-start;
}
.support-chat .user-message{
  align-self: flex-end;
  align-items: flex-end;
}
.support-chat .bot-message .bubble{
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 16px 16px 16px 4px;
  padding: 10px 14px;
}
.support-chat .user-message .bubble{
  background: linear-gradient(to right, #f5f8fb, #c9d4e1);
  border-radius: 16px 16px 4px 16px;
  padding: 10px 14px;
}
.support-chat .bot-message .bubble p{
  color: #e6ecf3;
  font-size: 14px;
  line-height: 1.4;
}
.support-chat .user-message .bubble p{
  color: #0c1a2d;
  font-size: 14px;
  line-height: 1.4;
}
.support-chat .bubble p{
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.support-chat .time{
  color: #75879c;
  font-size: 10px;
  margin-top: 4px;
}

/* quick replies */
.support-chat .quick-replies{
  padding: 0 14px 10px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}
.support-chat.is-page .quick-replies{
  padding: 0 16px 10px;
}
.support-chat .quick-replies::-webkit-scrollbar{
  display: none;
}
.support-chat .reply-chip{
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 15px;
  padding: 6px 12px;
  color: #d3dce7;
  font-size: 12px;
  white-space: nowrap;
}
.support-chat .reply-chip:disabled{
  opacity: 0.55;
  cursor: default;
}

/* composer */
.support-chat .chat-error{
  padding: 0 14px 8px;
  color: #f5808f;
  font-size: 12px;
  line-height: 1.4;
  flex-shrink: 0;
}
.support-chat .chat-input-area{
  padding: 10px 14px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.support-chat.is-page .chat-input-area{
  padding: 10px 16px 20px;
}
.support-chat .input-box{
  flex: 1;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 23px;
  height: 46px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  min-width: 0;
}
.support-chat .input-box input{
  color: #ffffff;
  font-size: 14px;
}
.support-chat .input-box input::placeholder{
  color: #75879c;
}
.support-chat .send-btn{
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background: linear-gradient(180deg, #f5f8fb 0%, #c9d4e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.support-chat .send-btn:disabled{
  opacity: 0.55;
  cursor: default;
}
@keyframes chat-sheet-fade{
  from{ opacity: 0; }
  to{ opacity: 1; }
}
@keyframes chat-sheet-up{
  from{ transform: translateY(18px); }
  to{ transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce){
  .support-chat.is-sheet,
  .support-chat.is-sheet .chat-bottom-sheet{
    animation: none;
  }
}
`;

// sender_type arrives as USER / ADMIN; everything that is not the account
// itself is drawn on the left, exactly like the Figma thread
const normalize = (raw) => ({
  id: raw.id,
  sender_type: raw.sender_type === 'USER' ? 'USER' : 'ADMIN',
  message: String(raw.message ?? ''),
  created_at: raw.created_at || '',
  pending: Boolean(raw.pending),
});

const sortMessages = (list) => {
  // a streamed row can arrive again through the REST re-read, so the thread is
  // keyed by id and the newest copy of each row wins
  const byId = new Map();
  for (const raw of list) {
    const row = normalize(raw);
    byId.set(row.id, row);
  }
  return [...byId.values()].sort(
    (a, b) => (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0)
  );
};

// the thread shows hours in the same 24h "10.21" shape as the Figma frame
const clockOf = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}.${mm}`;
};

export default function SupportChat({ variant = 'page', onClose, onBack }) {
  // the thread belongs to the signed-in account; the recovery form can open
  // this sheet while signed out, so it has to explain that instead of 401ing
  const { authed } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState(false);
  const listRef = useRef(null);

  const reload = useCallback(async () => {
    let res;
    try {
      res = await api.supportChat();
    } catch {
      setStatus((current) => (current === 'ready' ? current : 'error'));
      return false;
    }
    if (res.ok && Array.isArray(res.data)) {
      const fetched = sortMessages(res.data);
      setMessages((current) => {
        // keep an optimistic bubble until the send request answers
        const pending = current.filter(
          (item) =>
            item.pending &&
            !fetched.some(
              (row) => row.sender_type === 'USER' && row.message === item.message
            )
        );
        return [...fetched, ...pending];
      });
      setStatus('ready');
      setLive(true);
      return true;
    }
    setStatus((current) => (current === 'ready' ? current : 'error'));
    return false;
  }, []);

  // first paint reads the thread, then the SSE stream keeps it fresh. A stream
  // that cannot be opened (or ends) falls back to quiet polling, so the chat
  // still receives replies when a proxy buffers the connection.
  useEffect(() => {
    if (!authed) {
      setMessages([]);
      setLive(false);
      setStatus('signed-out');
      return undefined;
    }

    setStatus((current) => (current === 'signed-out' ? 'loading' : current));

    let closed = false;
    let stream = null;
    let poller = null;
    let debounce = null;

    const startPolling = () => {
      if (closed || poller) return;
      poller = window.setInterval(() => {
        if (!closed) reload();
      }, 6000);
    };

    const connect = async () => {
      // the thread read can resolve after the screen was left, so the stream
      // must not be opened once the effect has been cleaned up
      if (closed) return;
      if (!session.access) {
        startPolling();
        return;
      }
      stream = new AbortController();
      try {
        const res = await fetch(SUPPORT_CHAT_STREAM, {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${session.access}`,
          },
          signal: stream.signal,
        });
        if (closed) {
          stream.abort();
          return;
        }
        if (!res.ok || !res.body) throw new Error('stream unavailable');
        setLive(true);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (!closed) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE allows CRLF frames; normalise so the blank-line split works
          buffer = buffer.replace(/\r\n/g, '\n');
          let cut = buffer.indexOf('\n\n');
          while (cut >= 0) {
            const frame = buffer.slice(0, cut);
            buffer = buffer.slice(cut + 2);
            // the payload shape is not part of the contract: every data frame
            // re-reads the REST list, while comment heartbeats are ignored
            if (/^data:/m.test(frame)) {
              window.clearTimeout(debounce);
              debounce = window.setTimeout(() => {
                if (!closed) reload();
              }, 250);
            }
            cut = buffer.indexOf('\n\n');
          }
        }
        if (!closed) startPolling();
      } catch {
        if (!closed) startPolling();
      }
    };

    reload().finally(connect);

    return () => {
      closed = true;
      stream?.abort();
      if (poller) window.clearInterval(poller);
      if (debounce) window.clearTimeout(debounce);
    };
  }, [authed, reload]);

  // every new bubble (incoming or optimistic) brings the thread to its end
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (variant !== 'sheet') return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [variant, onClose]);

  const send = async (raw) => {
    const text = String(raw).trim();
    if (!authed || !text || sending) return;
    setSending(true);
    setError('');
    setDraft('');
    const optimistic = {
      id: `local-${Date.now()}`,
      sender_type: 'USER',
      message: text,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((current) => [...current, optimistic]);

    let res;
    let failed = false;
    try {
      res = await api.supportChatSend(text);
    } catch {
      failed = true;
    }

    if (failed || !res.ok) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      setDraft(text);
      setError(failed ? t('Pesan gagal dikirim.') : errorText(res.data, t('Pesan gagal dikirim.')));
    } else if (res.data && res.data.id != null) {
      const saved = normalize(res.data);
      setMessages((current) =>
        sortMessages([
          ...current.filter((item) => item.id !== optimistic.id && item.id !== saved.id),
          saved,
        ])
      );
    } else {
      // 2xx without the created row — re-read the thread instead of guessing
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      reload();
    }
    setSending(false);
  };

  const submit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    send(draft);
  };

  const online = authed && live;

  const avatar = (
    <div className="avatar-container">
      <div className="avatar">
        <img src="/assets/img/44675ad33b.svg" alt="" />
      </div>
      <span className={`status-dot${online ? '' : ' is-offline'}`}></span>
    </div>
  );

  const info = (
    <div className="header-info">
      <h2 className="chat-title">{t('Tim Bantuan')}</h2>
      <span className={`chat-status${online ? '' : ' is-offline'}`}>
        {!authed ? t('Belum masuk') : live ? t('Online') : t('Menghubungkan…')}
      </span>
    </div>
  );

  const thread = (
    <>
      <div className="chat-messages" ref={listRef} aria-live="polite">
        {status === 'loading' && <p className="chat-state">{t('Memuat percakapan…')}</p>}
        {status === 'error' && (
          <div className="chat-state">
            <p>{t('Percakapan gagal dimuat.')}</p>
            <button
              className="chat-retry"
              type="button"
              onClick={() => {
                setStatus('loading');
                reload();
              }}
            >
              {t('Coba lagi')}
            </button>
          </div>
        )}
        {status === 'signed-out' && (
          <div className="chat-state">
            <p>{t('Masuk dulu untuk chat dengan tim bantuan.')}</p>
            <button
              className="chat-retry"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                // the sheet swallows bubbling clicks, so this link cannot rely
                // on the frame's data-route delegation
                navigate('/login');
              }}
            >
              {t('Masuk')}
            </button>
          </div>
        )}
        {status === 'ready' && messages.length === 0 && (
          <p className="chat-state">{t('Belum ada pesan. Tulis pesan pertamamu di bawah ini.')}</p>
        )}
        {status === 'ready' &&
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender_type === 'USER' ? 'user-message' : 'bot-message'}`}
            >
              <div className="bubble">
                <p>{message.message}</p>
              </div>
              <span className="time">
                {clockOf(message.created_at)}
                {message.pending ? ` · ${t('Mengirim…')}` : ''}
              </span>
            </div>
          ))}
      </div>

      {authed && (
        <>
          <div className="quick-replies">
            <button
              className="reply-chip"
              type="button"
              disabled={sending}
              onClick={() => send(t('Lupa kata sandi'))}
            >
              {t('Lupa kata sandi')}
            </button>
            <button
              className="reply-chip"
              type="button"
              disabled={sending}
              onClick={() => send(t('Kode tidak masuk'))}
            >
              {t('Kode tidak masuk')}
            </button>
          </div>

          {error && (
            <p className="chat-error" role="alert">
              {error}
            </p>
          )}

          <form className="chat-input-area" onSubmit={submit}>
            <div className="input-box">
              <input
                type="text"
                placeholder={t('Tulis pesan…')}
                value={draft}
                maxLength={5000}
                autoFocus
                onChange={(event) => setDraft(event.target.value)}
              />
            </div>
            <button
              className="send-btn"
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label={t('Kirim pesan')}
            >
              <img src="/assets/img/79e1893f60.svg" alt="" />
            </button>
          </form>
        </>
      )}
    </>
  );

  if (variant === 'sheet') {
    const host = document.querySelector('.phone-frame') || document.body;
    return createPortal(
      <div
        className="support-chat is-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('Chat dengan tim bantuan')}
        onClick={(event) => {
          event.stopPropagation();
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <style>{css}</style>
        <div className="chat-bottom-sheet" onClick={(event) => event.stopPropagation()}>
          <header className="chat-header">
            {avatar}
            {info}
            <button className="close-btn" type="button" aria-label={t('Tutup chat')} onClick={onClose}>
              <img src="/assets/img/41d4579847.svg" alt="" />
            </button>
          </header>
          {thread}
        </div>
      </div>,
      host
    );
  }

  return (
    <div className="support-chat is-page" role="region" aria-label={t('Chat dengan tim bantuan')}>
      <style>{css}</style>
      <header className="chat-header">
        <button
          className="icon-btn"
          type="button"
          aria-label={t('Kembali')}
          onClick={(event) => {
            event.stopPropagation();
            onBack?.();
          }}
        >
          <img src="/assets/img/f77e40de90.svg" alt="" />
        </button>
        {avatar}
        {info}
      </header>
      {thread}
    </div>
  );
}
