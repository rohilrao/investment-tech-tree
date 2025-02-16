'use client';

import { exportGraphData } from '@/app/actions/server';
import { toastError } from '@/lib/toast';
import { useState } from 'react';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const result = await exportGraphData();

      const url = URL.createObjectURL(result.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toastError('Error while exporting graph', err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="p-2 bg-blue-500 text-white rounded h-10"
    >
      {loading ? 'exporting...' : 'export graph'}
    </button>
  );
}
