# Hồ sơ kiểm thử Website Quản lý phòng GYM

1. [Phân tích source và kiến trúc](PROJECT.md)
2. [Kế hoạch kiểm thử](testing/TEST_PLAN.md)
3. [70 test case chi tiết](testing/TEST_CASES.md)
4. [Ma trận truy vết](testing/TRACEABILITY_MATRIX.md)
5. [12 kịch bản E2E](testing/E2E_TEST.md)
6. [7 luồng Mermaid](testing/TEST_FLOW.md)
7. [Báo cáo lỗi](testing/BUG_REPORT.md)
8. [Kết quả chạy thực tế](testing/TEST_RESULTS.md)

Test case thủ công giữ trạng thái Not Run cho đến khi người kiểm thử thực hiện và điền kết quả. Kết quả tự động báo cáo riêng, không suy diễn rằng mọi test case thủ công đã đạt.

Mã kiểm thử: `tools/tests/gym.test.mjs`, `tools/tests/validation.test.mjs`, `tools/tests/mysql.test.mjs`, `tools/tests/system.test.mjs`, `tools/tests/e2e/gym.spec.ts`.
