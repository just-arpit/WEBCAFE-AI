const {onCall} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');
admin.initializeApp();

const fetch = global.fetch || require('node-fetch'); // Node 18+ has fetch

// Set global options for all v2 functions
setGlobalOptions({maxInstances: 10, region: 'us-central1'});

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Constants for security and performance
const MAX_CONTEXT_MESSAGES = 20; // Limit conversation history to control token usage
const MAX_TOKENS = 800; // Limit response length
const DEBOUNCE_MS = 500; // Write to Firestore every 500ms during streaming

// Helper to stream OpenAI chunks with debouncing
const streamOpenAI = async (messages, onChunk) => {
  const body = {
    model: 'gpt-4o-mini',
    messages,
    stream: true,
    max_tokens: MAX_TOKENS,
    temperature: 0.7
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('OpenAI API error:', res.status, errorText);
    throw new Error(`OpenAI error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let buffer = '';

  while (!done) {
    const {value, done: doneReading} = await reader.read();
    done = doneReading;
    if (value) {
      buffer += decoder.decode(value, {stream: true});
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep last partial line in buffer
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.replace(/^data:\s*/, '');
          if (payload === '[DONE]') return;
          try {
            const parsed = JSON.parse(payload);
            const chunk = parsed.choices?.[0]?.delta?.content || '';
            if (chunk) await onChunk(chunk);
          } catch (err) {
            console.error('Parse error:', err, 'payload:', payload);
          }
        }
      }
    }
  }
};

exports.generateResponse = onCall(async (request) => {
  // Security: ensure user is authenticated
  if (!request.auth) {
    throw new Error('User must be signed in');
  }

  const {conversationId, assistantId} = request.data;
  if (!conversationId || !assistantId) {
    throw new Error('Missing conversationId or assistantId');
  }

  const userId = request.auth.uid;
  const db = admin.firestore();
  const conversationRef = db.collection('conversations').doc(conversationId);
  const messagesCol = conversationRef.collection('messages');

  try {
    // Security: verify user owns this conversation
    const convDoc = await conversationRef.get();
    if (!convDoc.exists) {
      throw new Error('Conversation not found');
    }
    if (convDoc.data().ownerUid !== userId) {
      throw new Error('Not authorized to access this conversation');
    }

    // Read recent messages for context (limit to prevent token overflow)
    const snapshot = await messagesCol
      .orderBy('createdAt', 'desc')
      .limit(MAX_CONTEXT_MESSAGES)
      .get();
    
    const messages = [];
    const docs = [];
    snapshot.forEach((doc) => docs.push(doc));
    
    // Reverse to get chronological order
    docs.reverse().forEach((doc) => {
      const d = doc.data();
      if (d.text && d.text.trim()) {
        messages.push({
          role: d.role === 'user' ? 'user' : 'assistant',
          content: d.text.trim()
        });
      }
    });

    // Add system message for context
    messages.unshift({
      role: 'system',
      content: 'You are a helpful AI assistant. Provide concise, accurate, and friendly responses.'
    });

    const assistantRef = messagesCol.doc(assistantId);

    // Update status to streaming
    await assistantRef.update({status: 'streaming'});

    let fullText = '';
    let lastUpdate = Date.now();
    let updateScheduled = false;

    // Debounced update function
    const debouncedUpdate = async (force = false) => {
      const now = Date.now();
      if (force || (now - lastUpdate >= DEBOUNCE_MS)) {
        if (fullText) {
          await assistantRef.update({text: fullText, status: 'streaming'});
          lastUpdate = now;
        }
        updateScheduled = false;
      } else if (!updateScheduled) {
        updateScheduled = true;
        setTimeout(() => debouncedUpdate(false), DEBOUNCE_MS);
      }
    };

    // Stream OpenAI response
    await streamOpenAI(messages, async (chunk) => {
      fullText += chunk;
      await debouncedUpdate(false);
    });

    // Final update with complete text
    await assistantRef.update({
      text: fullText,
      status: 'done',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update conversation lastUpdatedAt
    await conversationRef.update({
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {success: true, messageId: assistantId};
  } catch (err) {
    console.error('LLM error:', err);
    
    // Update message with error status
    try {
      await messagesCol.doc(assistantId).update({
        status: 'error',
        text: 'Sorry, I encountered an error generating a response. Please try again.'
      });
    } catch (updateErr) {
      console.error('Failed to update error status:', updateErr);
    }

    // Return appropriate error
    throw new Error('Failed to generate response: ' + (err.message || 'Unknown error'));
  }
});
