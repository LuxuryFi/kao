# Attendance Module Setup Scripts

## Tổng quan
Các script SQL này được sử dụng để thiết lập database cho module Attendance.

## Scripts cần chạy

### 1. Tạo bảng attendance
```bash
mysql -u [username] -p [database_name] < database/create_attendance_table.sql
```
Hoặc chạy trực tiếp file: `database/create_attendance_table.sql`

Script này sẽ:
- Tạo bảng `attendance` với các cột cần thiết
- Tạo các indexes để tối ưu performance
- Tạo foreign keys để đảm bảo data integrity
- Tạo unique constraint để tránh duplicate attendance records

### 2. Thêm start_date vào subscription table (nếu chưa có)
```bash
mysql -u [username] -p [database_name] < database/alter_subscription_add_start_date.sql
```
Hoặc chạy trực tiếp file: `database/alter_subscription_add_start_date.sql`

Script này sẽ:
- Kiểm tra xem cột `start_date` đã tồn tại chưa
- Thêm cột `start_date` nếu chưa có
- Cột này lưu UNIX timestamp (seconds) để tính toán ngày học

## Cấu trúc bảng attendance

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key, auto increment |
| student_id | INT | Foreign key to public_user.id |
| course_id | INT | Foreign key to course.id |
| date | DATE | Ngày điểm danh (YYYY-MM-DD) |
| time | VARCHAR(10) | Giờ điểm danh (HH:mm) |
| status | VARCHAR(50) | Trạng thái: NOT_CHECKED_IN, CHECKED_IN, ABSENT_NO_REASON, ABSENT_WITH_REASON |
| created_date | DATETIME | Ngày tạo record |
| updated_date | DATETIME | Ngày cập nhật cuối |

## Indexes

- `idx_student_id`: Tối ưu query theo student
- `idx_course_id`: Tối ưu query theo course
- `idx_date`: Tối ưu query theo ngày
- `idx_status`: Tối ưu query theo trạng thái
- `idx_student_course_date`: Composite index cho query phức tạp
- `unique_student_course_date_time`: Unique constraint để tránh duplicate

## Foreign Keys

- `fk_attendance_student`: Liên kết với `public_user.id` (CASCADE delete/update)
- `fk_attendance_course`: Liên kết với `course.id` (CASCADE delete/update)

## Lưu ý

1. Đảm bảo các bảng `public_user` và `course` đã tồn tại trước khi chạy script
2. Script `alter_subscription_add_start_date.sql` sử dụng prepared statement để tránh lỗi nếu cột đã tồn tại
3. Sau khi chạy scripts, có thể sử dụng API `POST /attendances/create-for-all-users` để tạo attendance cho tất cả users có đủ điều kiện

## Kiểm tra sau khi chạy

```sql
-- Kiểm tra bảng attendance đã được tạo
DESCRIBE attendance;

-- Kiểm tra subscription có cột start_date
DESCRIBE subscription;

-- Kiểm tra indexes
SHOW INDEXES FROM attendance;
```
