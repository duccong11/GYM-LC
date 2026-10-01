import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/validation.ts';
export function errorHandler(
  e: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (e instanceof AppError)
    return res.status(e.status).json({ error: e.message });
  if (e.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'JSON không hợp lệ.' });
  if (e.type === 'entity.too.large')
    return res.status(413).json({ error: 'Dữ liệu quá lớn.' });
  if (e.code === 'ER_DUP_ENTRY') {
    const m = String(e.sqlMessage || '');
    const error =
      m.includes('members_phone') || m.includes('trainers_phone')
        ? 'Số điện thoại đã được sử dụng.'
        : m.includes('accounts_username')
          ? 'Tên đăng nhập đã tồn tại.'
          : m.includes('checkins_one_open')
            ? 'Hội viên đang ở trong phòng tập. Hãy check-out trước.'
            : 'Dữ liệu hoặc mã yêu cầu đã tồn tại.';
    return res.status(409).json({ error });
  }
  if (
    e.code === 'ER_CHECK_CONSTRAINT_VIOLATED' ||
    e.code === 'ER_NO_REFERENCED_ROW_2'
  )
    return res
      .status(400)
      .json({ error: 'Dữ liệu không thỏa ràng buộc cơ sở dữ liệu.' });
  console.error('Request failed:', e.code || e.name);
  return res
    .status(500)
    .json({
      error:
        'Không xử lý được yêu cầu. Kiểm tra kết nối MySQL hoặc liên hệ quản trị viên.',
    });
}
