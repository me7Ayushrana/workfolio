'use client';

import React, { Suspense } from 'react';
import DigitalWorkspaceApp from '@/components/digital-workspace/DigitalWorkspaceApp';

export default function DigitalWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-[#07070a] flex items-center justify-center text-white text-xs font-mono">
        Loading Digital Workspace...
      </div>
    }>
      <DigitalWorkspaceApp />
    </Suspense>
  );
}
