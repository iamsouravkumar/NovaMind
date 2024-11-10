import React from "react";
import { signOut } from "firebase/auth";
import { LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion'

const AvatarModal = ({ user, setUser, onClick }) => {

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed top-12 right-12 shadow-sm shadow-purple-500 rounded-xl flex flex-col gap-3 px-4 py-4 w-[15%] text-gray-100'>

            <div className="p-2">Hey, {user?.displayName}</div>
            <div className="flex flex-row items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer">
                <Settings className="w-5 h-5" />
                <button>Settings</button>
            </div>
            <div className="flex flex-row items-center gap-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer">
                <LogOut className="w-5 h-5" />
                <button onClick={handleLogout}>Logout</button>
            </div>

        </motion.div>


    )
}

export default AvatarModal