import React, {useEffect, useRef, useState} from 'react';
import {db, auth, functions, serverTimestamp, httpsCallable} from '../firebase';
import {collection, addDoc, doc, setDoc, onSnapshot, query, orderBy, updateDoc} from 'firebase/firestore';
import {v4 as uuidv4} from 'uuid';
import Message from './Message';

export default function Chat({conversationId}) {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const generateFn = httpsCallable(functions, 'generateResponse');

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time message updates
  useEffect(() => {
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({id: doc.id, ...doc.data()});
      });
      setMessages(msgs);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    const user = auth.currentUser;
    const userMsg = {
      text: text.trim(),
      senderUid: user.uid,
      role: 'user',
      createdAt: serverTimestamp(),
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || null
    };

    try {
      // Add user message
      await addDoc(messagesRef, userMsg);

      // Create assistant placeholder with predictable ID
      const assistantId = uuidv4();
      const assistantRef = doc(db, 'conversations', conversationId, 'messages', assistantId);
      await setDoc(assistantRef, {
        text: '',
        senderUid: 'assistant',
        role: 'assistant',
        createdAt: serverTimestamp(),
        status: 'pending',
        displayName: 'AI Assistant',
        photoURL: null
      });

      setText('');

      // Call cloud function to generate response
      await generateFn({conversationId, assistantId});
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>👋 Welcome! Ask me anything to get started.</p>
          </div>
        )}
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question..."
          disabled={isLoading}
          className="message-input"
          autoFocus
        />
        <button type="submit" disabled={isLoading || !text.trim()} className="send-button">
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </form>
    </div>
  );
}
