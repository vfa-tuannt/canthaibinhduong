# Feature Specification: Responsive UI, Đổi Tên Sản Phẩm & Lịch Sử Toàn Bộ

**Feature Branch**: `002-responsive-rename-history`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Responsive cho mobile/tablet, thêm tính năng đổi tên sản phẩm, thêm trang truy vấn lịch sử toàn bộ sản phẩm với filter theo ngày và dòng sản phẩm"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem và thao tác trên điện thoại (Priority: P1)

Người dùng cần sử dụng hệ thống quản lý tồn kho trên điện thoại di động một cách thuận tiện. Hiện tại giao diện chưa tối ưu cho màn hình nhỏ, gây khó khăn khi thao tác ngoài kho hàng hoặc khi di chuyển.

**Why this priority**: Người dùng thường xuyên cần kiểm tra tồn kho và nhập/xuất hàng ngay tại kho, nơi chỉ có điện thoại. Giao diện không responsive khiến thao tác chậm và dễ sai.

**Independent Test**: Mở ứng dụng trên điện thoại (hoặc trình duyệt ở chế độ responsive ≤480px), thực hiện đăng nhập, xem danh sách sản phẩm, điều chỉnh tồn kho → tất cả thao tác phải dễ dàng, không cần cuộn ngang.

**Acceptance Scenarios**:

1. **Given** người dùng mở ứng dụng trên điện thoại (viewport ≤480px), **When** trang tải xong, **Then** toàn bộ nội dung hiển thị vừa màn hình, không có thanh cuộn ngang.
2. **Given** người dùng đang xem danh sách sản phẩm trên điện thoại, **When** bấm vào nút điều chỉnh tồn kho, **Then** modal hiển thị đầy đủ, các nút bấm đủ lớn (≥44×44px) để chạm chính xác.
3. **Given** người dùng đang sử dụng thanh điều hướng trên điện thoại, **When** bấm vào menu, **Then** các mục navigation hiển thị rõ ràng, không bị chồng chéo.
4. **Given** người dùng sử dụng bảng dữ liệu trên điện thoại, **When** bảng có nhiều cột, **Then** bảng có thể cuộn ngang trong vùng chứa riêng (không ảnh hưởng đến layout trang).

---

### User Story 2 - Xem và thao tác trên tablet (Priority: P1)

Người dùng cần sử dụng hệ thống trên tablet với trải nghiệm tối ưu, tận dụng được không gian màn hình lớn hơn điện thoại nhưng nhỏ hơn desktop.

**Why this priority**: Tablet là thiết bị phổ biến tại văn phòng kho, cần trải nghiệm tốt song song với mobile.

**Independent Test**: Mở ứng dụng trên tablet (hoặc viewport 768px), thực hiện các thao tác chính → giao diện tận dụng không gian hợp lý.

**Acceptance Scenarios**:

1. **Given** người dùng mở ứng dụng trên tablet (viewport 768–1024px), **When** trang tải xong, **Then** layout tận dụng không gian rộng hơn so với mobile (ví dụ bảng hiển thị nhiều cột hơn, form rộng hơn).
2. **Given** người dùng đang xem danh sách sản phẩm trên tablet, **When** xem bảng dữ liệu, **Then** bảng hiển thị đầy đủ các cột chính mà không cần cuộn ngang.
3. **Given** người dùng sử dụng thanh điều hướng trên tablet, **When** xem navbar, **Then** navbar hiển thị đầy đủ các mục navigation theo hàng ngang.

---

### User Story 3 - Đổi tên sản phẩm (Priority: P2)

Người dùng cần đổi tên một sản phẩm đã tồn tại khi phát hiện tên sai hoặc cần cập nhật tên cho phù hợp (ví dụ: "CÂN GS" → "CÂN GIANG SƠN"). Hiện tại hệ thống chỉ cho phép tạo mới sản phẩm, không có chức năng sửa tên.

**Why this priority**: Tuy không phải nghiệp vụ cốt lõi hàng ngày, nhưng khi cần đổi tên mà không có tính năng này, người dùng phải tạo sản phẩm mới và nhập lại toàn bộ mẫu mã, rất mất thời gian.

**Independent Test**: Chọn một sản phẩm, bấm đổi tên, nhập tên mới → tên sản phẩm cập nhật thành công, các mẫu mã và lịch sử tồn kho không bị ảnh hưởng.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập và đang xem danh sách sản phẩm, **When** chọn chức năng đổi tên cho sản phẩm "CÂN TEST", **Then** hệ thống hiển thị ô nhập tên mới với tên hiện tại được điền sẵn.
2. **Given** người dùng đang đổi tên sản phẩm, **When** nhập tên mới "CÂN GIANG SƠN" và xác nhận, **Then** tên sản phẩm cập nhật thành công trong danh sách, thông báo thành công hiển thị.
3. **Given** người dùng đang đổi tên sản phẩm, **When** nhập tên trùng với sản phẩm đã tồn tại, **Then** hệ thống hiển thị thông báo lỗi "Tên sản phẩm đã tồn tại" và không thực hiện đổi tên.
4. **Given** người dùng đang đổi tên sản phẩm, **When** nhập tên rỗng hoặc chỉ có khoảng trắng, **Then** hệ thống hiển thị thông báo lỗi "Tên sản phẩm không được để trống".
5. **Given** sản phẩm đã được đổi tên, **When** xem lịch sử điều chỉnh tồn kho của các mẫu mã thuộc sản phẩm đó, **Then** lịch sử vẫn giữ nguyên, không bị mất hay thay đổi.

---

### User Story 4 - Xem lịch sử toàn bộ sản phẩm (Priority: P2)

Người dùng cần một trang riêng để xem lịch sử điều chỉnh tồn kho của TẤT CẢ sản phẩm theo thứ tự thời gian. Hiện tại lịch sử chỉ xem được theo từng mẫu mã (variant), khiến người dùng khó biết tổng quan vừa cập nhật những gì khi quản lý nhiều sản phẩm cùng lúc.

**Why this priority**: Đây là tính năng cải thiện đáng kể hiệu quả quản lý hàng ngày. Khi có nhiều sản phẩm, việc phải vào từng mẫu mã để xem lịch sử rất tốn thời gian.

**Independent Test**: Mở trang lịch sử toàn bộ → thấy danh sách tất cả thay đổi tồn kho gần đây, có thể lọc theo ngày và dòng sản phẩm.

**Acceptance Scenarios**:

1. **Given** người dùng đã đăng nhập, **When** bấm vào mục "Lịch sử" trên thanh điều hướng, **Then** hệ thống hiển thị trang lịch sử toàn bộ với danh sách các thay đổi tồn kho sắp xếp theo thời gian mới nhất lên đầu.
2. **Given** người dùng đang xem trang lịch sử toàn bộ, **When** mỗi dòng lịch sử hiển thị, **Then** dòng đó phải bao gồm: tên sản phẩm, tên mẫu mã, loại thay đổi (Nhập/Xuất), số lượng, tồn trước, tồn sau, ghi chú, và thời gian.
3. **Given** người dùng đang xem trang lịch sử, **When** chọn lọc theo khoảng ngày (từ ngày – đến ngày), **Then** chỉ hiển thị các bản ghi trong khoảng thời gian đã chọn.
4. **Given** người dùng đang xem trang lịch sử, **When** chọn lọc theo dòng sản phẩm (ví dụ: "CÂN GS"), **Then** chỉ hiển thị các bản ghi thuộc sản phẩm đó (tất cả mẫu mã của sản phẩm).
5. **Given** người dùng đang xem trang lịch sử, **When** kết hợp lọc theo ngày VÀ theo dòng sản phẩm, **Then** kết quả hiển thị đúng giao của cả hai bộ lọc.
6. **Given** không có bản ghi nào phù hợp bộ lọc, **When** áp dụng bộ lọc, **Then** hệ thống hiển thị thông báo "Không có dữ liệu phù hợp".

---

### Edge Cases

- Khi đổi tên sản phẩm, nếu hai người dùng cùng đổi tên một sản phẩm đồng thời → hệ thống xử lý theo cơ chế người đến sau nhận kết quả của người đến trước (last-write-wins), hiển thị tên đã cập nhật mới nhất.
- Khi trang lịch sử toàn bộ có rất nhiều bản ghi (>1000 dòng) → hệ thống cần phân trang hoặc giới hạn số bản ghi hiển thị mỗi lần để đảm bảo hiệu suất.
- Khi lọc lịch sử theo ngày nhưng người dùng chỉ chọn "Từ ngày" mà không chọn "Đến ngày" → hệ thống hiển thị tất cả bản ghi từ ngày đó đến hiện tại, và ngược lại.
- Khi sản phẩm bị đổi tên, lịch sử toàn bộ phải hiển thị tên MỚI của sản phẩm (không hiện tên cũ).
- Responsive: Bảng lịch sử toàn bộ trên mobile cần hiển thị các cột quan trọng nhất (sản phẩm, loại, số lượng, thời gian), các cột phụ có thể ẩn hoặc cuộn ngang.

## Requirements *(mandatory)*

### Functional Requirements

**Responsive UI (Mobile-First)**:

- **FR-001**: Giao diện PHẢI hiển thị đúng và sử dụng được trên thiết bị mobile (viewport ≤480px) mà không có thanh cuộn ngang ở cấp trang.
- **FR-002**: Giao diện PHẢI tối ưu layout cho tablet (viewport 481–1024px), tận dụng không gian rộng hơn so với mobile.
- **FR-003**: Giao diện PHẢI giữ nguyên trải nghiệm tốt trên desktop (viewport ≥1025px).
- **FR-004**: Tất cả các nút bấm và vùng tương tác PHẢI có kích thước tối thiểu 44×44px trên thiết bị cảm ứng.
- **FR-005**: Thanh điều hướng (navbar) PHẢI thích ứng với kích thước màn hình — trên mobile có thể thu gọn thành menu hamburger hoặc hiển thị dạng compact.
- **FR-006**: Bảng dữ liệu trên mobile PHẢI có thể cuộn ngang trong vùng chứa riêng khi có nhiều cột, không ảnh hưởng layout trang.

**Đổi tên sản phẩm**:

- **FR-007**: Người dùng PHẢI có khả năng đổi tên một sản phẩm đã tồn tại từ giao diện danh sách sản phẩm.
- **FR-008**: Hệ thống PHẢI hiển thị tên hiện tại của sản phẩm trong ô nhập khi bắt đầu đổi tên.
- **FR-009**: Hệ thống PHẢI kiểm tra tên mới không trùng với sản phẩm khác đã tồn tại (so sánh không phân biệt hoa/thường).
- **FR-010**: Hệ thống PHẢI kiểm tra tên mới không rỗng và không chỉ có khoảng trắng.
- **FR-011**: Việc đổi tên sản phẩm KHÔNG ĐƯỢC ảnh hưởng đến các mẫu mã (variant) và lịch sử điều chỉnh tồn kho liên kết.
- **FR-012**: Hệ thống PHẢI hiển thị thông báo thành công sau khi đổi tên và cập nhật danh sách sản phẩm ngay lập tức.

**Trang lịch sử toàn bộ**:

- **FR-013**: Hệ thống PHẢI cung cấp một trang riêng hiển thị lịch sử điều chỉnh tồn kho của TẤT CẢ sản phẩm và mẫu mã.
- **FR-014**: Mỗi bản ghi lịch sử PHẢI hiển thị: tên sản phẩm, tên mẫu mã, loại điều chỉnh (Nhập/Xuất), số lượng, tồn trước, tồn sau, ghi chú, và thời gian.
- **FR-015**: Danh sách lịch sử PHẢI sắp xếp theo thời gian mới nhất lên đầu (mặc định).
- **FR-016**: Người dùng PHẢI có khả năng lọc lịch sử theo khoảng ngày (từ ngày – đến ngày).
- **FR-017**: Người dùng PHẢI có khả năng lọc lịch sử theo dòng sản phẩm (chọn từ dropdown danh sách sản phẩm).
- **FR-018**: Hệ thống PHẢI hỗ trợ kết hợp đồng thời bộ lọc ngày và bộ lọc sản phẩm.
- **FR-019**: Khi không có bản ghi phù hợp bộ lọc, hệ thống PHẢI hiển thị thông báo trạng thái trống.
- **FR-020**: Trang lịch sử toàn bộ PHẢI có mục truy cập trực tiếp từ thanh điều hướng chính.
- **FR-021**: Khi số lượng bản ghi lớn, hệ thống PHẢI phân trang hoặc giới hạn hiển thị để đảm bảo thời gian tải chấp nhận được.

### Key Entities

- **Product (Sản phẩm)**: Đại diện cho một dòng sản phẩm (ví dụ: CÂN GS). Thuộc tính chính: ID, tên, ngày tạo. Tên có thể thay đổi (tính năng đổi tên mới).
- **Variant (Mẫu mã)**: Một biến thể cụ thể của sản phẩm với thông số riêng (ví dụ: 220G/-0,001G). Thuộc tính: ID, tên, mã, tồn kho hiện tại. Thuộc về một Product.
- **Adjustment History (Lịch sử điều chỉnh)**: Bản ghi mỗi lần thay đổi tồn kho. Thuộc tính: ID, variant liên kết, loại (Nhập/Xuất), số lượng, tồn trước, tồn sau, ghi chú, thời gian. Liên kết đến Variant (và qua đó đến Product).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể thực hiện tất cả thao tác chính (đăng nhập, xem sản phẩm, điều chỉnh tồn kho) trên điện thoại mà không cần cuộn ngang ở cấp trang.
- **SC-002**: Tất cả các nút bấm trên giao diện mobile đủ lớn để chạm chính xác mà không cần phóng to (≥44×44px).
- **SC-003**: Người dùng có thể đổi tên sản phẩm trong vòng 30 giây (mở form, nhập tên mới, xác nhận).
- **SC-004**: Người dùng có thể tìm được bản ghi thay đổi tồn kho gần nhất của bất kỳ sản phẩm nào trong vòng 1 phút thông qua trang lịch sử toàn bộ (bao gồm thời gian lọc).
- **SC-005**: Trang lịch sử toàn bộ hiển thị kết quả lọc trong vòng 3 giây khi có dưới 5.000 bản ghi.
- **SC-006**: 100% các trang và modal hiển thị đúng trên cả ba kích thước viewport: mobile (≤480px), tablet (768px), desktop (1280px).

## Assumptions

- Người dùng truy cập hệ thống qua trình duyệt web trên điện thoại, tablet hoặc máy tính — không có ứng dụng native.
- Theo Constitution §VIII, toàn bộ giao diện được phát triển theo phương pháp mobile-first: CSS mặc định cho mobile, mở rộng lên tablet/desktop bằng `min-width` media queries.
- Hệ thống đăng nhập hiện tại (username/password) sẽ được tái sử dụng, không thay đổi.
- Cấu trúc dữ liệu hiện tại (Products, Variants, Adjustment History trên Google Sheets) đủ để hỗ trợ trang lịch sử toàn bộ — chỉ cần join dữ liệu từ các sheet có sẵn.
- Trang lịch sử toàn bộ sẽ lọc dữ liệu phía client (sau khi tải từ server) cho lượng dữ liệu dưới 5.000 bản ghi. Nếu vượt quá, cần xem xét phân trang phía server.
- Việc đổi tên sản phẩm không cần ghi nhận lịch sử riêng (audit log) — chỉ cập nhật trực tiếp tên trên sheet Products.
