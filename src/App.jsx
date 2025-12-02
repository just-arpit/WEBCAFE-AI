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

  useEffect(() => {
    if (!user) {
      setConversationId(null);
      setIsLoading(false);
      return;
    }

    // Find or create a conversation for this user
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('ownerUid', '==', user.uid),
      orderBy('lastUpdatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        // Use existing conversation
        setConversationId(snapshot.docs[0].id);
      } else {
        // Create new conversation
        try {
          const newConv = await addDoc(conversationsRef, {
            title: 'New Conversation',
            ownerUid: user.uid,
            createdAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            visibility: 'private'
          });
          setConversationId(newConv.id);
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
      setIsLoading(false);
    });

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
        ) : conversationId ? (
          <Chat conversationId={conversationId} />
        ) : (
          <div className="error">Failed to load conversation. Please refresh.</div>
        )}
      </main>
    </div>
  );
}

export default App;
