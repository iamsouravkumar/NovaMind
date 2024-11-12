import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, auth } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const chatService = {
  // Generate AI response directly using Gemini
  async generateResponse(message) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  },

  // Create new chat
  async createChat(userMessage) {
    try {
      const aiResponse = await this.generateResponse(userMessage);
      const now = Timestamp.now();
      
      const chatRef = await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        title: userMessage.slice(0, 30) + '...',
        messages: [
          {
            content: userMessage,
            role: 'user',
            timestamp: now
          },
          {
            content: aiResponse,
            role: 'assistant',
            timestamp: now
          }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return chatRef.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Add message to existing chat
  async addMessage(chatId, userMessage) {
    try {
      const aiResponse = await this.generateResponse(userMessage);
      const now = Timestamp.now();
      
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        messages: arrayUnion(
          {
            content: userMessage,
            role: 'user',
            timestamp: now
          },
          {
            content: aiResponse,
            role: 'assistant',
            timestamp: now
          }
        ),
        updatedAt: serverTimestamp()
      });

      return aiResponse;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  // Subscribe to chats
  subscribeToChats(callback) {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(chats);
    });
  },

  // Delete chat
  async deleteChat(chatId) {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // Update chat title
  async updateTitle(chatId, newTitle) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  }
}; 