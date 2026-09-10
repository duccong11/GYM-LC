# Sơ đồ kiến trúc và dữ liệu

```mermaid
flowchart LR
 U[Actor ADMIN STAFF TRAINER] --> V[View React frontend]
 V --> A[API services frontend]
 A --> R[Routes Express]
 R --> C[Controllers]
 C --> M[Middleware session role CSRF]
 M --> S[Service nghiệp vụ]
 S --> D[Model và transaction]
 D --> DB[(MySQL)]
```

```mermaid
erDiagram
 roles ||--o{ accounts : "phân quyền"
 accounts ||--o{ sessions : "có phiên"
 accounts ||--o{ audit_logs : "thực hiện"
 members ||--o{ payments : "đăng ký và thanh toán"
 plans ||--o{ payments : "gói đã mua"
 members ||--o{ checkins : "vào ra"
 rooms ||--o{ equipment : "chứa"
```

Huấn luyện viên được quản lý ở trainers; hồ sơ này độc lập với accounts. login_attempts lưu giới hạn đăng nhập. mutation_lock bảo vệ transaction ghi. Các kiểu cột, CHECK và index chuẩn nằm trong backend/sql/01_schema.sql.
