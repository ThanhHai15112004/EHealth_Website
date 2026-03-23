/* ===================================================================
   Landing page — shared data constants
   =================================================================== */

export const IMG = {
    hero: "/img/general/hero-doctor.png",
    heroBg: "/img/general/hero-bg.png",
    about: "/img/general/about-hospital.png",
    ctaBg: "/img/general/cta-bg.png",
    doctors: ["/img/doctors/doctor-1.png", "/img/doctors/doctor-2.png", "/img/doctors/doctor-3.png", "/img/doctors/doctor-4.png"],
    services: ["/img/services/cardiology.png", "/img/services/neurology.png", "/img/services/dermatology.png", "/img/services/pediatrics.png", "/img/services/ophthalmology.png", "/img/services/dentistry.png"],
    testimonials: ["/img/testimonials/patient-1.png", "/img/testimonials/patient-2.png", "/img/testimonials/patient-3.png"],
};

export const SERVICES = [
    { icon: "cardiology", title: "Tim mạch", desc: "Khám, chẩn đoán và điều trị toàn diện bệnh lý tim mạch với trang thiết bị hiện đại nhất.", color: "from-red-500 to-rose-600", img: IMG.services[0] },
    { icon: "neurology", title: "Thần kinh", desc: "Điều trị đau đầu, đột quỵ, Parkinson, và các rối loạn thần kinh phức tạp.", color: "from-violet-500 to-purple-600", img: IMG.services[1] },
    { icon: "dermatology", title: "Da liễu", desc: "Chăm sóc da, điều trị mụn, nám, và các bệnh lý da liễu bằng công nghệ laser.", color: "from-amber-500 to-orange-600", img: IMG.services[2] },
    { icon: "child_care", title: "Nhi khoa", desc: "Chăm sóc sức khoẻ toàn diện cho trẻ em từ sơ sinh đến 16 tuổi.", color: "from-cyan-500 to-teal-600", img: IMG.services[3] },
    { icon: "visibility", title: "Nhãn khoa", desc: "Khám mắt, phẫu thuật laser LASIK, điều trị tật khúc xạ chuyên sâu.", color: "from-blue-500 to-indigo-600", img: IMG.services[4] },
    { icon: "dentistry", title: "Răng hàm mặt", desc: "Nha khoa tổng hợp: nhổ răng, trồng Implant, niềng răng, thẩm mỹ cười.", color: "from-emerald-500 to-green-600", img: IMG.services[5] },
];

export const DOCTORS = [
    { name: "PGS.TS. Trần Văn Minh", title: "Trưởng khoa Tim mạch", exp: "25 năm kinh nghiệm", specialties: ["Can thiệp mạch vành", "Suy tim", "Rối loạn nhịp"], img: IMG.doctors[0] },
    { name: "TS.BS. Nguyễn Thị Hoa", title: "Chuyên gia Da liễu", exp: "18 năm kinh nghiệm", specialties: ["Laser trị nám", "Trị mụn", "Thẩm mỹ da"], img: IMG.doctors[1] },
    { name: "BS.CK2. Phạm Đức Long", title: "Trưởng khoa Nhi", exp: "20 năm kinh nghiệm", specialties: ["Hô hấp nhi", "Tiêu hoá nhi", "Dinh dưỡng"], img: IMG.doctors[2] },
    { name: "TS.BS. Lê Hoàng Anh", title: "Chuyên gia Thần kinh", exp: "15 năm kinh nghiệm", specialties: ["Đột quỵ", "Parkinson", "Đau đầu mạn"], img: IMG.doctors[3] },
];

export const TESTIMONIALS = [
    { name: "Chị Nguyễn Thị Mai", age: 45, text: "Tôi rất hài lòng với dịch vụ tại EHealth. Bác sĩ Minh đã giúp tôi phát hiện và điều trị kịp thời bệnh tim. Quy trình đặt lịch rất thuận tiện.", rating: 5, img: IMG.testimonials[0] },
    { name: "Anh Trần Đức Hùng", age: 38, text: "Đưa con đi khám nhi ở đây rất yên tâm. BS. Long rất tận tình, giải thích cặn kẽ cho ba mẹ. Sẽ quay lại lần tới.", rating: 5, img: IMG.testimonials[1] },
    { name: "Chị Lê Phương Thảo", age: 32, text: "Điều trị da liễu tại đây hiệu quả ngoài mong đợi. Sau 3 tháng da đã cải thiện rõ rệt. Cảm ơn BS. Hoa rất nhiều!", rating: 5, img: IMG.testimonials[2] },
];

export const COUNTER_STATS = [
    { label: "Bệnh nhân tin tưởng", value: 50000, suffix: "+", icon: "groups" },
    { label: "Bác sĩ chuyên khoa", value: 120, suffix: "+", icon: "medical_services" },
    { label: "Năm hoạt động", value: 15, suffix: "", icon: "calendar_month" },
    { label: "Tỷ lệ hài lòng", value: 98, suffix: "%", icon: "thumb_up" },
];

export const PROCESS_STEPS = [
    { step: "01", title: "Đặt lịch online", desc: "Chọn bác sĩ, chuyên khoa và khung giờ phù hợp chỉ trong 2 phút", icon: "calendar_month" },
    { step: "02", title: "Xác nhận lịch hẹn", desc: "Nhận SMS/email xác nhận trong vòng 30 phút", icon: "verified" },
    { step: "03", title: "Khám bệnh", desc: "Đến bệnh viện đúng giờ, không cần chờ đợi lâu", icon: "stethoscope" },
    { step: "04", title: "Nhận kết quả", desc: "Xem kết quả xét nghiệm và đơn thuốc trực tuyến", icon: "assignment" },
];

export const NAV_ITEMS = [
    { id: "services", label: "Dịch vụ" },
    { id: "doctors", label: "Bác sĩ" },
    { id: "about", label: "Giới thiệu" },
    { id: "testimonials", label: "Đánh giá" },
    { id: "faq", label: "FAQ" },
    { id: "contact", label: "Liên hệ" },
];

export const FAQ_DATA = [
    { q: "Làm thế nào để đặt lịch khám?", a: "Bạn có thể đặt lịch khám trực tiếp trên website bằng cách điền form \"Đặt lịch khám\" hoặc gọi hotline (028) 1234 5678. Chúng tôi sẽ xác nhận lịch hẹn qua SMS trong vòng 30 phút." },
    { q: "Bệnh viện có nhận BHYT không?", a: "Có. EHealth Hospital là cơ sở khám chữa bệnh được BHXH công nhận. Chúng tôi nhận tất cả các loại thẻ BHYT theo quy định hiện hành. Vui lòng mang theo thẻ BHYT và CMND/CCCD khi đến khám." },
    { q: "Chi phí khám bệnh khoảng bao nhiêu?", a: "Chi phí khám chuyên khoa từ 200.000 — 500.000đ tuỳ loại dịch vụ. Khám tổng quát từ 1.500.000đ. Chi phí xét nghiệm và cận lâm sàng sẽ được tư vấn cụ thể sau khi khám." },
    { q: "Bệnh viện làm việc vào Chủ nhật không?", a: "Bệnh viện làm việc từ Thứ 2 — Thứ 7 (7:00 — 20:00). Chủ nhật chỉ tiếp nhận cấp cứu 24/7. Các dịch vụ đặc biệt có thể hẹn riêng ngoài giờ hành chính." },
    { q: "Tôi có thể xem kết quả xét nghiệm online không?", a: "Có. Sau khi đăng ký tài khoản trên hệ thống EHealth, bạn có thể xem kết quả xét nghiệm, lịch sử khám bệnh, đơn thuốc trực tuyến bất cứ lúc nào." },
    { q: "Bệnh viện có dịch vụ tư vấn từ xa không?", a: "Có. Chúng tôi cung cấp dịch vụ Telemedicine — tư vấn sức khoẻ trực tuyến qua video call với bác sĩ chuyên khoa. Đặt lịch tư vấn từ xa tại mục \"Đặt lịch khám\" và chọn hình thức \"Tư vấn online\"." },
];
