'use client';

import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import PasswordModal from './LoginModal';
import TechTree from './TechTree';
import '@xyflow/react/dist/style.css';

export const TechTreeContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(
    false || process.env.NEXT_PUBLIC_STAGE === 'dev',
  );

  const handleLoginForEdit = () => {
    if (isEditable) {
      setIsEditable(false);
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
        <TechTree isEditable={isEditable} loginForEdit={handleLoginForEdit} />
      </div>
    </ReactFlowProvider>
  );
};
