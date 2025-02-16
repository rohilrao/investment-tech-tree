'use client';

import { useGraphContext } from '@/app/GraphContext';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import PasswordModal from './LoginModal';
import TechTree from './TechTree';

export const TechTreeContainer = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isEditable, setIsEditable } = useGraphContext();

  const handleLoginForEdit = () => {
    if (isEditable) {
      setIsEditable(false); //logout if logged in
    } else {
      setIsEditModalOpen(true);
    }
  };

  return (
    <ReactFlowProvider>
      <PasswordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <TechTree loginForEdit={handleLoginForEdit} />
    </ReactFlowProvider>
  );
};
