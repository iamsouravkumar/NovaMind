//#171717
import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';

const Sidebar = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className=''>
      <h2>Previous Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id}>
            <div>
              <p><strong>You:</strong> {chat.userMessage}</p>
              <p><strong>GPT:</strong> {chat.gptResponse}</p>
            </div>
            <div>
              <p className="timestamp">
                {format(chat.timestamp.toDate(), "p, MMM d")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
