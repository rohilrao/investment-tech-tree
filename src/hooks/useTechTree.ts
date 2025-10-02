'use client';

import { useState, useEffect } from 'react';
import { TechTree } from '@/lib/types';

export function useTechTree() {
  const [techTree, setTechTree] = useState<TechTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTechTree() {
      try {
        setIsLoading(true);
        const response = await fetch('/investment-tech-tree/api/tech-tree');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tech tree data');
        }

        const data = await response.json();
        setTechTree(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching tech tree:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTechTree();
  }, []);

  return { techTree, isLoading, error };
}