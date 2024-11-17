import { GoogleGenerativeAI } from "@google/generative-ai";
// import { GoogleAIFileManager } from "@google/generative-ai/server";
import { db, auth } from '../config/firebase';
import {toast} from 'react-hot-toast'
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
  Timestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
// const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GEMINI_API_KEY);

export const chatService = {
  // Generate AI response directly using Gemini
  async generateResponse(message, model = "gemini-1.5-flash", chatHistory = []) {
    try {
      // Combine chat history with the new message
      const context = chatHistory.map(msg => `${msg.content}`).join('\n');
      const fullMessage = `${context}\nUser: ${message}`; // Format the message for the AI

      const generativeModel = genAI.getGenerativeModel({ model });
      const result = await generativeModel.generateContent(fullMessage);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      toast.error('Failed to generate response. Please try again.');

      // Check for quota exhaustion error
      if (error.message.includes('Resource has been exhausted')) {
        // Display remaining quota or tokens
        const remainingQuota = await this.checkRemainingQuota(); // Implement this method
        toast.error(`Quota exhausted. Remaining tokens: ${remainingQuota}`);
        throw new Error('Your message was blocked due to quota exhaustion. Please try again later.');
      }

      if (error.message.includes('Candidate was blocked due to SAFETY')) {
        throw new Error('Your message was blocked due to safety concerns. Please try rephrasing it.');
      }
      throw error; // Rethrow other errors
    }
  },

  // Create new chat
  async createChat(userMessage, selectedModel) {
    try {
      const aiResponse = await this.generateResponse(userMessage, selectedModel, []); // No history for new chat
      const now = Timestamp.now();
      
      const chatRef = await addDoc(collection(db, 'chats'), {
        userId: auth.currentUser.uid,
        title: userMessage.slice(0, 30),
        model: selectedModel,
        archived: false,
        
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
  async addMessage(chatId, userMessage, selectedModel) {
    try {
      const chatHistory = await this.fetchChatHistory(chatId); // Fetch chat history
      const aiResponse = await this.generateResponse(userMessage, selectedModel, chatHistory); // Pass chat history
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

  // Fetch chat history by chat ID
  async fetchChatHistory(chatId) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        return chatDoc.data().messages; // Return the messages array
      } else {
        throw new Error('Chat not found');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  // Subscribe to chats
  subscribeToChats(callback) {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', auth.currentUser.uid),
      where('archived', '==', false), // Only subscribe to non-archived chats
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

  // Archive chat
  // async archiveChat(chatId) {
  //   // Validate chatId
  //   if (typeof chatId !== 'string' || chatId.trim() === '') {
  //     throw new Error('Invalid chat ID provided for archiving.');
  //   }

  //   try {
  //     const chatRef = doc(db, 'chats', chatId);
  //     await updateDoc(chatRef, {
  //       archived: true,
  //       updatedAt: serverTimestamp()
  //     });
  //   } catch (error) {
  //     console.error('Error archiving chat:', error);
  //     throw error;
  //   }
  // },

  // Delete chat
  async deleteChat(chatId) {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },

  // Delete all chats
  async deleteAllChats() {
    try {
      const querySnapshot = await getDocs(collection(db, 'chats'));
      if (querySnapshot.empty) { // Check if there are no chats
        throw new Error('No chats to delete');
      }
      querySnapshot.forEach(doc => {
        deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error deleting all chats:', error);
      throw error; // Rethrow the error for handling in the calling function
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
  },

  // Analyze image and ask questions about it
  // async analyzeImage(base64data, prompt) {
  //   try {
  //     // Prepare the image data
  //     const image = {
  //       inlineData: {
  //         data: base64data.split(',')[1], // Get the base64 part
  //         mimeType: "image/png", // Adjust based on your image type
  //       },
  //     };

  //     // Use the model to generate content based on the image and prompt
  //     const response = await model.generateContent([
  //       prompt,
  //       {
  //         fileData: image.inlineData,
  //         mimeType: image.inlineData.mimeType,
  //       },
  //     ]);

  //     return response.response.text(); // Return the response text
  //   } catch (error) {
  //     console.error('Error analyzing image:', error);
  //     throw error;
  //   }
  // }

  async fetchArchivedChats() {
    try {
        const q = query(
            collection(db, 'chats'),
            where('userId', '==', auth.currentUser.uid),
            where('archived', '==', true), // Fetch only archived chats
            orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const archivedChats = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return archivedChats; // Return the fetched archived chats
    } catch (error) {
        console.error('Error fetching archived chats:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
  }
}; 