'use client';

import { useGraphContext } from '@/app/GraphContext';
import { motion } from 'framer-motion';
import { useState } from 'react';

const PasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const { setIsEditable } = useGraphContext();

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  const handleSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_EDIT_PASSWORD) {
      setIsEditable(true);
      setPassword('');
      onClose();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg z-50">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          className="border p-2 w-full mb-4"
          placeholder="Password"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            Confirm
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
