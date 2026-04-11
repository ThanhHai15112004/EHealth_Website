import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { FloatingChatBox } from "@/components/shared/FloatingChatBox";

export const metadata: Metadata = {
    title: "EHealth Hospital — Bệnh viện Đa khoa hàng đầu | Đặt lịch khám online",
    description: "Hệ thống Y tế Thông minh EHealth — Đặt lịch khám online, theo dõi sức khoẻ 24/7, đội ngũ 120+ bác sĩ chuyên khoa.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
                />
            </head>
            <body className="antialiased">
                <ToastProvider>
                    <AuthProvider>
                        {children}
                        <FloatingChatBox />
                    </AuthProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
