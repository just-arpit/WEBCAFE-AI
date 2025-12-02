import {useEffect, useState} from 'react';
import {useAuthState} from 'react-firebase-hooks/auth';
import {auth, db, serverTimestamp} from './firebase';
import {collection, addDoc, query, where, orderBy, limit, onSnapshot} from 'firebase/firestore';
import Chat from './components/Chat';
import SignIn from './components/SignIn';
import SignOut from './components/SignOut';

function App() {
  const [user] = useAuthState(auth);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setConversationId(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setError(null);

    // Find or create a conversation for this user
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('ownerUid', '==', user.uid),
      orderBy('lastUpdatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          if (!snapshot.empty) {
            // Use existing conversation
            setConversationId(snapshot.docs[0].id);
          } else {
            // Create new conversation
            const newConv = await addDoc(conversationsRef, {
              title: 'New Conversation',
              ownerUid: user.uid,
              createdAt: serverTimestamp(),
              lastUpdatedAt: serverTimestamp(),
              visibility: 'private'
            });
            setConversationId(newConv.id);
          }
          setIsLoading(false);
        } catch (err) {
          console.error('Error creating conversation:', err);
          setError(err.message || 'Failed to create conversation');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Error loading conversations:', err);
        setError(err.message || 'Failed to load conversation');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>☕ Webcafe AI</h1>
        {user && <SignOut />}
      </header>
      <main className="app-main">
        {!user ? (
          <SignIn />
        ) : isLoading ? (
          <div className="loading">Loading conversation...</div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button 
              className="retry-btn" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : conversationId ? (
          <Chat conversationId={conversationId} />
        ) : (
          <div className="error-container">
            <div className="error-message">Failed to load conversation. Please refresh.</div>
            <button 
              className="retry-btn" 
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
