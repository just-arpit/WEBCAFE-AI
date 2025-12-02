import {auth} from '../firebase';

function Message({message}) {
  const {text, senderUid, role, photoURL, displayName, status} = message;
  const isUser = senderUid === auth.currentUser?.uid;
  const messageClass = isUser ? 'sent' : 'received';
  
  // Show loading indicator for streaming messages
  const isStreaming = status === 'streaming' || status === 'pending';
  const hasError = status === 'error';

  return (
    <div className={`message ${messageClass}`}>
      <div className="message-info">
        <img
          src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderUid}`}
          alt="avatar"
          className="avatar"
        />
        <span className="display-name">{displayName || (isUser ? 'You' : 'AI Assistant')}</span>
      </div>
      <div className="message-content">
        <p className={hasError ? 'error-text' : ''}>
          {text || (isStreaming ? '🤔 Thinking...' : '')}
        </p>
        {isStreaming && text && <span className="typing-indicator">▊</span>}
      </div>
    </div>
  );
}

export default Message;
