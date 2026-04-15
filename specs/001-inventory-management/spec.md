# Feature Specification: Inventory Management System

**Feature Branch**: `001-inventory-management`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "Quản lý cân tồn kho sử dụng Google Apps Script + Google Sheets"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng nhập hệ thống (Priority: P1)

Người dùng cần đăng nhập vào hệ thống để sử dụng các tính năng quản lý tồn kho. Hệ thống chỉ cho phép user đã được cấu hình sẵn (tienha/hatien) truy cập.

**Why this priority**: Đây là điều kiện tiên quyết để sử dụng mọi tính năng khác. Không có đăng nhập, người dùng không thể truy cập hệ thống.

**Independent Test**: Mở ứng dụng, nhập thông tin đăng nhập → hệ thống xác thực và cho phép/từ chối truy cập.

**Acceptance Scenarios**:

1. **Given** người dùng chưa đăng nhập, **When** nhập username "tienha" và password "hatien", **Then** hệ thống cho phép truy cập vào trang chính.
2. **Given** người dùng chưa đăng nhập, **When** nhập thông tin đăng nhập sai, **Then** hệ thống hiển thị thông báo lỗi và không cho phép truy cập.
3. **Given** người dùng đang sử dụng hệ thống, **When** đóng trình duyệt và mở lại trong vòng 7 ngày, **Then** người dùng được tự động đăng nhập lại mà không cần nhập lại thông tin.

---

### User Story 2 - Quản lý sản phẩm và mẫu mã (Priority: P1)

Người dùng cần quản lý danh sách sản phẩm (ví dụ: CÂN GS, CÂN CAS, CÂN TIỂU LY). Mỗi sản phẩm có thể có nhiều mẫu mã (variant/SKU) với các thông số khác nhau (ví dụ: 220G/-0,001G, 320G/-0,001G).

**Why this priority**: Đây là dữ liệu nền tảng. Không có sản phẩm thì không thể theo dõi tồn kho.

**Independent Test**: Tạo một sản phẩm mới với mẫu mã, xem danh sách, tìm kiếm → xác nhận dữ liệu hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** tạo sản phẩm mới với tên "CÂN TEST" và mẫu mã "100G/0.01G", **Then** sản phẩm xuất hiện trong danh sách.
2. **Given** có danh sách sản phẩm, **When** tìm kiếm với từ khóa "GS", **Then** hệ thống hiển thị tất cả sản phẩm có chứa "GS" trong tên hoặc mẫu mã.
3. **Given** một sản phẩm đã tồn tại, **When** thêm mẫu mã mới cho sản phẩm đó, **Then** mẫu mã mới xuất hiện dưới sản phẩm.
4. **Given** danh sách sản phẩm dài, **When** xem danh sách, **Then** hệ thống hiển thị có phân trang hoặc cuộn dễ dàng.

---

### User Story 3 - Điều chỉnh số lượng tồn kho (Priority: P1)

Người dùng cần điều chỉnh số lượng tồn kho của từng mẫu mã sản phẩm khi có nhập/xuất hàng. Mỗi lần điều chỉnh phải được ghi nhận vào lịch sử.

**Why this priority**: Đây là nghiệp vụ cốt lõi của hệ thống quản lý tồn kho.

**Independent Test**: Điều chỉnh số lượng một mẫu mã → xác nhận số lượng mới và kiểm tra lịch sử.

**Acceptance Scenarios**:

1. **Given** mẫu mã "220G/-0,001G" có số lượng tồn kho là 10, **When** người dùng nhập thêm 5 sản phẩm, **Then** số lượng tồn kho trở thành 15 và có một bản ghi lịch sử.
2. **Given** mẫu mã có số lượng tồn kho là 10, **When** người dùng xuất 3 sản phẩm, **Then** số lượng tồn kho trở thành 7 và có một bản ghi lịch sử.
3. **Given** một mẫu mã đã có nhiều lần điều chỉnh, **When** xem lịch sử, **Then** hệ thống hiển thị danh sách các lần điều chỉnh theo thời gian (mới nhất trước).
4. **Given** người dùng đang điều chỉnh, **When** nhập số lượng âm hoặc không hợp lệ, **Then** hệ thống từ chối và hiển thị thông báo lỗi.

---

### User Story 4 - Xem lịch sử điều chỉnh tồn kho (Priority: P2)

Người dùng cần xem lại lịch sử các lần điều chỉnh tồn kho để kiểm tra và đối soát.

**Why this priority**: Tính năng hỗ trợ audit và đối soát, quan trọng nhưng không ảnh hưởng đến nghiệp vụ chính.

**Independent Test**: Sau khi điều chỉnh tồn kho, mở lịch sử → thấy thông tin chi tiết của lần điều chỉnh.

**Acceptance Scenarios**:

1. **Given** một mẫu mã có lịch sử điều chỉnh, **When** người dùng xem lịch sử, **Then** hiển thị: ngày giờ, loại (nhập/xuất), số lượng thay đổi, số lượng trước/sau.
2. **Given** lịch sử dài, **When** lọc theo khoảng thời gian, **Then** hệ thống chỉ hiển thị các bản ghi trong khoảng thời gian đó.

---

### User Story 5 - Dashboard thống kê theo tháng (Priority: P2)

Người dùng cần một dashboard để so sánh tồn kho giữa các tháng, thấy tổng nhập/xuất và xu hướng.

**Why this priority**: Cung cấp cái nhìn tổng quan, hỗ trợ ra quyết định nhưng không ảnh hưởng đến nghiệp vụ nhập/xuất hàng ngày.

**Independent Test**: Mở dashboard → thấy biểu đồ/bảng so sánh tồn kho giữa các tháng.

**Acceptance Scenarios**:

1. **Given** dữ liệu tồn kho nhiều tháng, **When** mở dashboard, **Then** hiển thị bảng tổng hợp: tồn đầu kỳ, tổng nhập, tổng xuất, tồn cuối kỳ cho mỗi tháng.
2. **Given** dashboard đang hiển thị, **When** chọn một sản phẩm cụ thể, **Then** hiển thị chi tiết tồn kho theo tháng cho sản phẩm đó.
3. **Given** dashboard đang hiển thị, **When** chọn so sánh 2 tháng, **Then** hiển thị sự chênh lệch giữa 2 tháng được chọn.

---

### Edge Cases

- Điều chỉnh xuất kho vượt quá số lượng tồn: Hệ thống cảnh báo và không cho phép (số lượng không được âm).
- Đăng nhập sai quá nhiều lần: Hệ thống không khóa tài khoản (chấp nhận để đơn giản, chỉ có 1 user).
- Tạo sản phẩm/mẫu mã trùng tên: Hệ thống cảnh báo và yêu cầu đặt tên khác.
- Dữ liệu lớn (>500 sản phẩm): Hệ thống vẫn hoạt động trong giới hạn 6 phút của GAS.
- Truy cập đồng thời từ nhiều tab: Dữ liệu sheet sẽ được cập nhật real-time; các tab đọc sẽ thấy dữ liệu mới nhất.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI có giao diện web (HTML Service) để người dùng tương tác.
- **FR-002**: Hệ thống PHẢI xác thực người dùng với username "tienha" và password "hatien" trước khi cho phép truy cập.
- **FR-003**: Hệ thống PHẢI cho phép tạo sản phẩm mới với tên sản phẩm.
- **FR-004**: Hệ thống PHẢI cho phép tạo mẫu mã (variant) cho mỗi sản phẩm với mã sản phẩm và số lượng tồn ban đầu.
- **FR-005**: Hệ thống PHẢI hiển thị danh sách tất cả sản phẩm và mẫu mã với số lượng tồn kho hiện tại.
- **FR-006**: Hệ thống PHẢI cho phép tìm kiếm sản phẩm/mẫu mã theo tên hoặc mã.
- **FR-007**: Hệ thống PHẢI cho phép điều chỉnh số lượng tồn kho (nhập/xuất) cho từng mẫu mã.
- **FR-008**: Hệ thống PHẢI ghi lại lịch sử mỗi lần điều chỉnh tồn kho với: thời gian, loại (nhập/xuất), số lượng, ghi chú.
- **FR-009**: Hệ thống PHẢI cho phép xem lịch sử điều chỉnh của từng mẫu mã.
- **FR-010**: Hệ thống PHẢI có dashboard hiển thị tổng hợp tồn kho theo tháng.
- **FR-011**: Hệ thống PHẢI ngăn chặn xuất kho khi số lượng tồn không đủ (không cho phép số lượng âm).
- **FR-012**: Hệ thống PHẢI lưu trữ dữ liệu trên Google Sheets (mỗi sheet là một bảng dữ liệu).

### Key Entities

- **Product (Sản phẩm)**: Đại diện cho một loại sản phẩm. Thuộc tính: ID, tên sản phẩm, ngày tạo.
- **Variant (Mẫu mã)**: Đại diện cho một biến thể cụ thể của sản phẩm. Thuộc tính: ID, Product ID (liên kết), mã sản phẩm, số lượng tồn hiện tại.
- **Inventory Adjustment (Điều chỉnh tồn kho)**: Ghi lại mỗi lần thay đổi số lượng. Thuộc tính: ID, Variant ID (liên kết), thời gian, loại (nhập/xuất), số lượng thay đổi, số lượng trước, số lượng sau, ghi chú.
- **User Session**: Trạng thái đăng nhập của người dùng (lưu trong ScriptProperties với TTL 7 ngày, token được lưu client-side trong localStorage).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể đăng nhập và truy cập hệ thống trong vòng 10 giây.
- **SC-002**: Người dùng có thể tạo sản phẩm mới và mẫu mã trong vòng 30 giây.
- **SC-003**: Người dùng có thể tìm kiếm và thấy kết quả trong vòng 3 giây với danh sách dưới 500 mẫu mã.
- **SC-004**: Người dùng có thể điều chỉnh tồn kho và thấy cập nhật ngay lập tức (dưới 5 giây).
- **SC-005**: 100% các lần điều chỉnh tồn kho được ghi vào lịch sử không sót.
- **SC-006**: Dashboard hiển thị dữ liệu tổng hợp chính xác với sai số 0% so với dữ liệu gốc.
- **SC-007**: Hệ thống hoạt động ổn định trong giới hạn GAS (6 phút execution time, 100 emails/day quota không áp dụng cho tính năng này).
- **SC-008**: Người dùng không cần hướng dẫn kỹ thuật để sử dụng các chức năng cơ bản (giao diện trực quan).

## Assumptions

- **Target user**: Một người dùng duy nhất (tienha) với quyền truy cập đầy đủ. Không cần phân quyền phức tạp.
- **Data volume**: Dự kiến dưới 500 sản phẩm và 2000 mẫu mã. Phù hợp với giới hạn Google Sheets và GAS.
- **Browser support**: Người dùng sử dụng trình duyệt hiện đại (Chrome, Firefox, Edge, Safari phiên bản mới).
- **Network**: Người dùng có kết nối internet ổn định để truy cập Google Apps Script.
- **Authentication**: Sử dụng xác thực đơn giản (username/password so sánh trực tiếp). Session token lưu trong ScriptProperties với TTL 7 ngày.
- **Spreadsheet access**: Sử dụng `SpreadsheetApp.openById()` với SPREADSHEET_ID từ ScriptProperties (standalone script, không dùng `getActiveSpreadsheet()`).
- **Web app access**: Cấu hình `ANYONE_ANONYMOUS` để cho phép truy cập từ tài khoản cá nhân.
- **Data migration**: Dữ liệu từ file Excel/CSV hiện tại sẽ được import thủ công vào Google Sheets ban đầu (không nằm trong scope tự động).
- **Mobile support**: Giao diện responsive tối thiểu, ưu tiên desktop.
- **Concurrent access**: Chỉ một người dùng nên không cần xử lý conflict phức tạp.
