import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boo Account - Admin",
  description: "Trang quản trị Boo Account",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
