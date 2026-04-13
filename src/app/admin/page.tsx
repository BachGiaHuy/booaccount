"use client";

import dynamic from "next/dynamic";

const AdminContent = dynamic(() => import("@/components/AdminContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  ),
});

export default function AdminPage() {
  return <AdminContent />;
}
