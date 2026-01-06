# Student Table Migration Guide

## Tổng quan
Migration này chuyển đổi từ việc sử dụng user role "student" sang sử dụng bảng `student` riêng biệt.

## Các bước migration

### Bước 1: Tạo bảng student
```bash
mysql -u [username] -p [database_name] < database/create_student_table.sql
```

### Bước 2: Migrate dữ liệu từ public_user sang student
**QUAN TRỌNG**: Cần cập nhật script `migrate_student_data.sql` để phù hợp với dữ liệu thực tế của bạn:
- Cập nhật logic tính `age` nếu có thông tin ngày sinh
- Xử lý các trường hợp `parent_id` NULL (nếu có)
- Kiểm tra dữ liệu trước khi chạy migration

```bash
mysql -u [username] -p [database_name] < database/migrate_student_data.sql
```

### Bước 3: Cập nhật foreign keys
Sau khi đã migrate dữ liệu, cập nhật các foreign key để reference đến bảng `student`:

```bash
mysql -u [username] -p [database_name] < database/migrate_to_student_table.sql
```

## Cấu trúc bảng student

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto increment |
| name | VARCHAR(256) | Tên học sinh |
| age | INT | Tuổi |
| phone | VARCHAR(50) | Số điện thoại (nullable) |
| parent_id | INT | ID của parent user (references public_user.id) |
| created_at | BIGINT | UNIX timestamp |
| updated_date | DATETIME | Ngày cập nhật cuối |
| created_by | VARCHAR(256) | Người tạo |
| updated_by | VARCHAR(256) | Người cập nhật |

## Các bảng được cập nhật

1. **course_student**: `student_id` giờ reference đến `student.id` thay vì `public_user.id`
2. **attendance**: `student_id` giờ reference đến `student.id` thay vì `public_user.id`
3. **subscription**: `user_id` được đổi thành `student_id` và reference đến `student.id`

## Lưu ý

- **Backup database** trước khi chạy migration
- Kiểm tra dữ liệu sau mỗi bước migration
- Có thể cần điều chỉnh script migration dựa trên dữ liệu thực tế
- Sau khi migration xong, các API sẽ sử dụng `/students/by-parent/:parentId` thay vì `/users/by-parent/:parentId`

## Rollback

Nếu cần rollback, bạn sẽ cần:
1. Khôi phục foreign keys về `public_user`
2. Đổi lại `subscription.student_id` thành `user_id`
3. Xóa dữ liệu trong bảng `student` (nếu cần)

