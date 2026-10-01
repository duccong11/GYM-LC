import { roleLabel, type Role } from '../utils/security';

const duties: Record<Role, [string, string]> = {
  ADMIN: [
    'Quản lý tài khoản, phân quyền và cấu hình hệ thống.',
    'Không quản lý nghiệp vụ hội viên, thu tiền, lịch tập hoặc báo cáo doanh thu.',
  ],
  MANAGER: [
    'Quản lý hội viên, dịch vụ, khuyến mãi lễ/Tết, gói tập, HLV, phòng, thiết bị; phân công, xếp lịch, thu tiền, điểm danh và xử lý hủy. Xem doanh thu ngày/tháng/năm và 3 gói được sử dụng nhiều nhất.',
    'Không quản lý tài khoản, phân quyền hoặc cấu hình hệ thống.',
  ],
  STAFF: [
    'Tiếp nhận và cập nhật hội viên, đăng ký gói, ghi nhận thu tiền, xếp lịch, điểm danh và kết thúc lượt tập. Xem danh mục để tư vấn.',
    'Không sửa danh mục hay giá gói; không hủy giao dịch, đăng ký hoặc lịch; không xem báo cáo doanh thu, quản lý tài khoản hay cấu hình hệ thống.',
  ],
  TRAINER: [
    'Xem lịch của mình và hội viên được phân công; tra cứu gói tập và phòng tập.',
    'Không tự tạo/sửa/hủy lịch, sửa hội viên, thu tiền, xem báo cáo doanh thu hoặc quản lý tài khoản.',
  ],
  MEMBER: [
    'Xem hồ sơ, đăng ký gói và lịch của bản thân; tra cứu gói tập.',
    'Không xem dữ liệu của hội viên khác hoặc thay đổi dữ liệu quản lý.',
  ],
};

export default function RoleGuide({ role }: { role: Role }) {
  return (
    <details className="role-guide">
      <summary>Công việc và quyền hạn — {roleLabel[role]}</summary>
      <p>
        <strong>Được thực hiện: </strong>
        {duties[role][0]}
      </p>
      <p>
        <strong>Không được thực hiện: </strong>
        {duties[role][1]}
      </p>
    </details>
  );
}
