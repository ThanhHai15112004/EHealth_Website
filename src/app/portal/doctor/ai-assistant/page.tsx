"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_MESSAGES = [
    { id: 1, role: "user", content: "Tôi bị đau đầu và chóng mặt 3 ngày nay, kèm theo mệt mỏi", time: "10:30" },
    { id: 2, role: "ai", content: "Tôi hiểu bạn đang gặp các triệu chứng đau đầu, chóng mặt và mệt mỏi. Để đưa ra đánh giá chính xác hơn, tôi cần hỏi thêm:\n\n1. **Vị trí đau đầu**: Đau ở vùng nào (trán, thái dương, sau gáy)?\n2. **Cường độ**: Đau âm ỉ hay dữ dội?\n3. **Tiền sử**: Bạn có bệnh nền như tăng huyết áp, tiểu đường không?\n4. **Thuốc**: Gần đây có dùng thuốc gì mới không?\n\nDựa trên triệu chứng ban đầu, có thể liên quan đến:\n- Hạ huyết áp\n- Thiếu máu\n- Stress, mất ngủ\n- Rối loạn tiền đình", time: "10:31" },
    { id: 3, role: "user", content: "Đau vùng thái dương, âm ỉ. Tôi có tiền sử tăng huyết áp", time: "10:32" },
    { id: 4, role: "ai", content: "Cảm ơn thông tin bổ sung. Với tiền sử **tăng huyết áp** kèm triệu chứng đau đầu vùng thái dương và chóng mặt, tôi khuyến nghị:\n\n⚠️ **Cần khám ngay**: Triệu chứng này có thể liên quan đến huyết áp tăng cao hoặc cần điều chỉnh thuốc.\n\n**Gợi ý chuyên khoa**: Tim mạch hoặc Nội tổng quát\n\n**Bác sĩ phù hợp**:\n- BS. Trần Văn Minh — Chuyên khoa Tim mạch\n- BS. Phạm Chí Thanh — Nội tổng quát\n\nBạn có muốn tôi đặt lịch khám không?", time: "10:33" },
];

export default function AIAssistantPage() {
    const router = useRouter();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), role: "user", content: input, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Giả lập AI trả lời
        setTimeout(() => {
            setMessages((prev) => [...prev, {
                id: Date.now() + 1, role: "ai", time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                content: "Tôi đã ghi nhận thông tin. Dựa trên triệu chứng bạn mô tả, tôi khuyên bạn nên đến khám trực tiếp để được chẩn đoán chính xác hơn. Bạn có muốn tôi đặt lịch hẹn không?"
            }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="p-6 md:p-8"><div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#121417] dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3C81C6]" style={{ fontSize: "28px" }}>smart_toy</span>
                        Trợ lý AI Y tế
                    </h1>
                    <p className="text-sm text-[#687582] mt-1">Hỗ trợ tư vấn triệu chứng và gợi ý chẩn đoán</p>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "20px" }}>warning</span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Lưu ý:</strong> AI chỉ mang tính chất tham khảo, không thay thế bác sĩ. Mọi kết quả cần được xác nhận bởi bác sĩ chuyên khoa.
                </p>
            </div>

            {/* Chat Area */}
            <div className="bg-white dark:bg-[#1e242b] rounded-xl border border-[#dde0e4] dark:border-[#2d353e] flex flex-col" style={{ height: "calc(100vh - 320px)" }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "ai" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: "16px" }}>smart_toy</span>
                                </div>
                            )}
                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                    ? "bg-[#3C81C6] text-white rounded-br-md"
                                    : "bg-[#f6f7f8] dark:bg-[#13191f] text-[#121417] dark:text-white rounded-bl-md"
                                }`}>
                                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                                <p className={`text-xs mt-1.5 ${msg.role === "user" ? "text-blue-200" : "text-[#687582]"}`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3C81C6] to-[#60a5fa] flex items-center justify-center">
                                <span className="material-symbols-outlined text-white" style={{ fontSize: "16px" }}>smart_toy</span>
                            </div>
                            <div className="bg-[#f6f7f8] dark:bg-[#13191f] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="px-6 py-2 border-t border-[#dde0e4] dark:border-[#2d353e] flex gap-2 overflow-x-auto">
                    {["Kiểm tra triệu chứng", "Gợi ý đặt lịch", "Tóm tắt bệnh án", "Tra cứu thuốc"].map((action) => (
                        <button key={action} onClick={() => setInput(action)}
                            className="px-3 py-1.5 rounded-full border border-[#dde0e4] dark:border-[#2d353e] text-xs text-[#687582] hover:bg-[#f6f7f8] dark:hover:bg-[#13191f] transition-colors whitespace-nowrap">
                            {action}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#dde0e4] dark:border-[#2d353e]">
                    <div className="flex items-center gap-3">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Nhập câu hỏi hoặc mô tả triệu chứng..."
                            className="flex-1 px-4 py-3 bg-[#f6f7f8] dark:bg-[#13191f] border border-[#dde0e4] dark:border-[#2d353e] rounded-xl text-sm outline-none focus:border-[#3C81C6] transition-colors" />
                        <button onClick={handleSend} disabled={!input.trim() || isTyping}
                            className="p-3 bg-[#3C81C6] hover:bg-[#2a6da8] text-white rounded-xl transition-colors disabled:opacity-50">
                            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div></div>
    );
}
