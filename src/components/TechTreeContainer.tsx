'use client';

import { useGraphContext } from '@/app/GraphContext';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import PasswordModal from './LoginModal';
import TechTree from './TechTree';

export const TechTreeContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isEditable, setIsEditable } = useGraphContext();

  const handleLoginForEdit = () => {
    if (isEditable) {
      setIsEditable(false); //logout if logged in
    } else {
      setIsModalOpen(true);
    }
  };

  const handlePasswordSubmit = (password: string): boolean => {
    if (password === process.env.NEXT_PUBLIC_EDIT_PASSWORD) {
      setIsEditable(true);
      return true;
    }
    return false;
  };

  return (
    <ReactFlowProvider>
      <div>
        <PasswordModal
          isOpen={isModalOpen}
          onSubmit={handlePasswordSubmit}
          onClose={() => setIsModalOpen(false)}
        />
        <TechTree loginForEdit={handleLoginForEdit} />
      </div>
    </ReactFlowProvider>
  );
};
