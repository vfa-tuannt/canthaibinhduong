(function() {
  "use strict";

  // ==========================================================
  // CẤU HÌNH: Thay URL bên dưới bằng URL deploy GAS của bạn
  // ==========================================================
  var API_URL = "https://script.google.com/macros/s/AKfycbwa5JZK86mypsH0J64ofyAC7-M-wj0DewpO1Sum4Lh0n6ezGGsKAtAvwvvTs_o92vE9/exec";

  // ---------- API Helper ----------
  function callApi(action, params) {
    if (API_URL === "PASTE_YOUR_GAS_DEPLOYMENT_URL_HERE") {
      return Promise.reject(new Error("Chưa cấu hình API_URL. Vui lòng cập nhật trong file app.js"));
    }
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: action, params: params || {} }),
      redirect: "follow"
    }).then(function(response) {
      if (!response.ok) throw new Error("Lỗi mạng: " + response.status);
      return response.json();
    });
  }

  // ---------- State ----------
  var sessionToken = null;
  var allProducts = [];

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }

  function showView(viewId) {
    document.querySelectorAll("#app-shell .view").forEach(function(v) {
      v.classList.remove("active");
    });
    var el = $(viewId);
    if (el) el.classList.add("active");
    document.querySelectorAll(".nav-link[data-view]").forEach(function(a) {
      a.classList.toggle("active", "view-" + a.dataset.view === viewId);
    });
  }

  function showLoading(id) { var el = $(id); if (el) el.style.display = "flex"; }
  function hideLoading(id) { var el = $(id); if (el) el.style.display = "none"; }

  function showError(containerId, msg) {
    var el = $(containerId);
    if (el) { el.textContent = msg; el.className = "error-msg"; el.style.display = "block"; }
  }

  function showSuccess(containerId, msg) {
    var el = $(containerId);
    if (el) { el.textContent = msg; el.className = "success-msg"; el.style.display = "block"; }
  }

  function hideMsg(containerId) {
    var el = $(containerId);
    if (el) el.style.display = "none";
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- Modal ----------
  function openModal(title, bodyHtml) {
    $("modal-title").textContent = title;
    $("modal-body").innerHTML = bodyHtml;
    $("modal-overlay").style.display = "flex";
  }

  function closeModal() {
    $("modal-overlay").style.display = "none";
    $("modal-body").innerHTML = "";
  }

  $("modal-close").addEventListener("click", closeModal);
  $("modal-overlay").addEventListener("click", function(e) {
    if (e.target === $("modal-overlay")) closeModal();
  });

  // ---------- Navigation ----------
  document.querySelectorAll(".nav-link[data-view]").forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      var view = this.dataset.view;
      if (view === "products") { showView("view-products"); loadProducts(); }
      else if (view === "dashboard") { showView("view-dashboard"); loadDashboard(); }
    });
  });

  // ---------- Auth ----------
  $("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    hideMsg("login-error");
    var user = $("username").value.trim();
    var pass = $("password").value;
    if (!user || !pass) { showError("login-error", "Vui lòng nhập đầy đủ thông tin."); return; }
    $("login-btn").disabled = true;
    callApi("login", { username: user, password: pass })
      .then(function(result) {
        $("login-btn").disabled = false;
        if (result.success) {
          sessionToken = result.token;
          try { localStorage.setItem("sessionToken", sessionToken); } catch(ex) {}
          $("view-login").style.display = "none";
          $("app-shell").style.display = "block";
          showView("view-products");
          loadProducts();
        } else {
          showError("login-error", result.error || "Đăng nhập thất bại.");
        }
      })
      .catch(function(err) {
        $("login-btn").disabled = false;
        showError("login-error", "Lỗi máy chủ: " + err.message);
      });
  });

  $("logout-btn").addEventListener("click", function(e) {
    e.preventDefault();
    if (sessionToken) {
      callApi("logout", { token: sessionToken });
    }
    sessionToken = null;
    try { localStorage.removeItem("sessionToken"); } catch(ex) {}
    $("app-shell").style.display = "none";
    $("view-login").style.display = "flex";
    $("username").value = "";
    $("password").value = "";
  });

  // ---------- Products ----------
  function loadProducts() {
    showLoading("products-loading");
    $("products-list").innerHTML = "";
    callApi("getProducts", { token: sessionToken })
      .then(function(result) {
        hideLoading("products-loading");
        if (result.success) {
          allProducts = result.data || [];
          renderProducts(allProducts);
        } else {
          $("products-list").innerHTML = '<div class="error-msg">' + escapeHtml(result.error) + '</div>';
        }
      })
      .catch(function(err) {
        hideLoading("products-loading");
        $("products-list").innerHTML = '<div class="error-msg">Lỗi: ' + escapeHtml(err.message) + '</div>';
      });
  }

  function renderProducts(products) {
    if (!products || products.length === 0) {
      $("products-list").innerHTML = '<div class="empty-state">Chưa có sản phẩm nào. Nhấn "+ Sản phẩm" để thêm.</div>';
      return;
    }
    var html = '<table class="data-table"><thead><tr>'
      + '<th>Tên sản phẩm</th><th>Mẫu mã</th><th>Mã SP</th><th>Tồn kho</th><th>Thao tác</th>'
      + '</tr></thead><tbody>';
    products.forEach(function(p) {
      html += '<tr class="product-row"><td colspan="4">' + escapeHtml(p.name) + '</td>'
        + '<td><button class="btn btn-sm btn-primary" onclick="window._addVariant(\'' + escapeHtml(p.id) + '\',\'' + escapeHtml(p.name) + '\')">+ Mẫu mã</button></td></tr>';
      if (p.variants && p.variants.length) {
        p.variants.forEach(function(v) {
          var stockClass = v.currentStock === 0 ? ' class="stock-zero"' : '';
          html += '<tr><td></td><td>' + escapeHtml(v.variantName) + '</td><td>' + escapeHtml(v.variantCode)
            + '</td><td' + stockClass + '>' + v.currentStock + '</td><td>'
            + '<button class="btn btn-sm btn-success" onclick="window._adjustStock(\'' + escapeHtml(v.id) + '\',\'' + escapeHtml(v.variantName) + '\',' + v.currentStock + ')">Điều chỉnh</button> '
            + '<button class="btn btn-sm btn-secondary" onclick="window._viewHistory(\'' + escapeHtml(v.id) + '\',\'' + escapeHtml(v.variantName) + '\')">Lịch sử</button>'
            + '</td></tr>';
        });
      }
    });
    html += '</tbody></table>';
    $("products-list").innerHTML = html;
  }

  // Search
  var searchTimer = null;
  $("search-input").addEventListener("input", function() {
    clearTimeout(searchTimer);
    var q = this.value.trim();
    searchTimer = setTimeout(function() {
      if (!q) { renderProducts(allProducts); return; }
      showLoading("products-loading");
      callApi("searchProducts", { token: sessionToken, query: q })
        .then(function(result) {
          hideLoading("products-loading");
          if (result.success) renderProducts(result.data || []);
        })
        .catch(function() { hideLoading("products-loading"); });
    }, 300);
  });

  // Add product
  $("btn-add-product").addEventListener("click", function() {
    openModal("Thêm sản phẩm", ''
      + '<div class="form-group"><label>Tên sản phẩm</label><input type="text" id="new-product-name" /></div>'
      + '<div id="modal-msg" style="display:none;"></div>'
      + '<button class="btn btn-primary" id="btn-submit-product">Lưu</button>'
    );
    $("btn-submit-product").addEventListener("click", function() {
      var name = $("new-product-name").value.trim();
      if (!name) { showError("modal-msg", "Vui lòng nhập tên sản phẩm."); return; }
      this.disabled = true;
      hideMsg("modal-msg");
      callApi("createProduct", { token: sessionToken, name: name })
        .then(function(r) {
          if (r.success) { closeModal(); loadProducts(); }
          else { showError("modal-msg", r.error); $("btn-submit-product").disabled = false; }
        })
        .catch(function(err) { showError("modal-msg", err.message); $("btn-submit-product").disabled = false; });
    });
  });

  // Add variant
  window._addVariant = function(productId, productName) {
    openModal("Thêm mẫu mã – " + productName, ''
      + '<div class="form-group"><label>Tên mẫu mã</label><input type="text" id="new-variant-name" /></div>'
      + '<div class="form-group"><label>Mã sản phẩm</label><input type="text" id="new-variant-code" /></div>'
      + '<div class="form-group"><label>Số lượng tồn ban đầu</label><input type="number" id="new-variant-stock" value="0" min="0" /></div>'
      + '<div id="modal-msg" style="display:none;"></div>'
      + '<button class="btn btn-primary" id="btn-submit-variant">Lưu</button>'
    );
    $("btn-submit-variant").addEventListener("click", function() {
      var vn = $("new-variant-name").value.trim();
      var vc = $("new-variant-code").value.trim();
      var vs = parseInt($("new-variant-stock").value, 10);
      if (!vn || !vc) { showError("modal-msg", "Vui lòng nhập đầy đủ thông tin."); return; }
      if (isNaN(vs) || vs < 0) { showError("modal-msg", "Số lượng phải >= 0."); return; }
      this.disabled = true;
      hideMsg("modal-msg");
      callApi("createVariant", {
        token: sessionToken,
        productId: productId,
        variantName: vn,
        variantCode: vc,
        initialStock: vs
      })
        .then(function(r) {
          if (r.success) { closeModal(); loadProducts(); }
          else { showError("modal-msg", r.error); $("btn-submit-variant").disabled = false; }
        })
        .catch(function(err) { showError("modal-msg", err.message); $("btn-submit-variant").disabled = false; });
    });
  };

  // Adjust stock
  window._adjustStock = function(variantId, variantName, currentStock) {
    openModal("Điều chỉnh tồn kho – " + variantName, ''
      + '<p><strong>Tồn hiện tại:</strong> ' + currentStock + '</p>'
      + '<div class="form-group"><label>Loại</label><select id="adj-type"><option value="IMPORT">Nhập kho</option><option value="EXPORT">Xuất kho</option></select></div>'
      + '<div class="form-group"><label>Số lượng</label><input type="number" id="adj-qty" min="1" value="1" /></div>'
      + '<div class="form-group"><label>Ghi chú</label><textarea id="adj-note" rows="2"></textarea></div>'
      + '<div id="modal-msg" style="display:none;"></div>'
      + '<button class="btn btn-primary" id="btn-submit-adj">Xác nhận</button>'
    );
    $("btn-submit-adj").addEventListener("click", function() {
      var type = $("adj-type").value;
      var qty = parseInt($("adj-qty").value, 10);
      var note = $("adj-note").value.trim();
      if (isNaN(qty) || qty <= 0) { showError("modal-msg", "Số lượng phải > 0."); return; }
      this.disabled = true;
      hideMsg("modal-msg");
      callApi("adjustStock", {
        token: sessionToken,
        variantId: variantId,
        type: type,
        quantity: qty,
        note: note
      })
        .then(function(r) {
          if (r.success) {
            showSuccess("modal-msg", "Thành công! Trước: " + r.stockBefore + " → Sau: " + r.stockAfter);
            setTimeout(function() { closeModal(); loadProducts(); }, 1200);
          } else {
            showError("modal-msg", r.error);
            $("btn-submit-adj").disabled = false;
          }
        })
        .catch(function(err) { showError("modal-msg", err.message); $("btn-submit-adj").disabled = false; });
    });
  };

  // View history
  window._viewHistory = function(variantId, variantName) {
    $("history-title").textContent = "Lịch sử – " + variantName;
    showView("view-history");
    showLoading("history-loading");
    $("history-list").innerHTML = "";
    $("history-from").value = "";
    $("history-to").value = "";
    callApi("getAdjustmentHistory", { token: sessionToken, variantId: variantId })
      .then(function(result) {
        hideLoading("history-loading");
        if (result.success) {
          window._historyData = result.data || [];
          renderHistory(window._historyData);
        } else {
          $("history-list").innerHTML = '<div class="error-msg">' + escapeHtml(result.error) + '</div>';
        }
      })
      .catch(function(err) {
        hideLoading("history-loading");
        $("history-list").innerHTML = '<div class="error-msg">Lỗi: ' + escapeHtml(err.message) + '</div>';
      });
  };

  function renderHistory(data) {
    if (!data || data.length === 0) {
      $("history-list").innerHTML = '<div class="empty-state">Chưa có lịch sử điều chỉnh.</div>';
      return;
    }
    var html = '<table class="data-table"><thead><tr>'
      + '<th>Thời gian</th><th>Loại</th><th>Số lượng</th><th>Trước</th><th>Sau</th><th>Ghi chú</th>'
      + '</tr></thead><tbody>';
    data.forEach(function(r) {
      var tagClass = r.adjustmentType === "IMPORT" ? "tag-import" : "tag-export";
      var tagLabel = r.adjustmentType === "IMPORT" ? "Nhập" : "Xuất";
      html += '<tr><td>' + escapeHtml(r.createdAt) + '</td>'
        + '<td><span class="tag ' + tagClass + '">' + tagLabel + '</span></td>'
        + '<td>' + r.quantity + '</td><td>' + r.stockBefore + '</td><td>' + r.stockAfter + '</td>'
        + '<td>' + escapeHtml(r.note || "") + '</td></tr>';
    });
    html += '</tbody></table>';
    $("history-list").innerHTML = html;
  }

  // History date filters
  function filterHistory() {
    var from = $("history-from").value;
    var to = $("history-to").value;
    if (!window._historyData) return;
    var filtered = window._historyData.filter(function(r) {
      var d = r.createdAt.substring(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    renderHistory(filtered);
  }
  $("history-from").addEventListener("change", filterHistory);
  $("history-to").addEventListener("change", filterHistory);

  $("btn-back-products").addEventListener("click", function() {
    showView("view-products");
    loadProducts();
  });

  // ---------- Dashboard ----------
  function loadDashboard() {
    var yearSelect = $("dashboard-year");
    if (yearSelect.options.length === 0) {
      var currentYear = new Date().getFullYear();
      for (var y = currentYear; y >= currentYear - 3; y--) {
        var opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      }
    }
    var year = parseInt(yearSelect.value, 10);
    showLoading("dashboard-loading");
    $("dashboard-content").innerHTML = "";
    callApi("getDashboardData", { token: sessionToken, year: year })
      .then(function(result) {
        hideLoading("dashboard-loading");
        if (result.success) {
          renderDashboard(result);
        } else {
          $("dashboard-content").innerHTML = '<div class="error-msg">' + escapeHtml(result.error) + '</div>';
        }
      })
      .catch(function(err) {
        hideLoading("dashboard-loading");
        $("dashboard-content").innerHTML = '<div class="error-msg">Lỗi: ' + escapeHtml(err.message) + '</div>';
      });
  }

  $("dashboard-year").addEventListener("change", loadDashboard);

  function renderDashboard(result) {
    var months = result.monthly || [];
    var products = result.products || [];
    var monthNames = ["","Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

    var html = '<h3 style="margin:16px 0 8px;">Thống kê theo tháng</h3>';
    html += '<table class="data-table"><thead><tr>'
      + '<th>Tháng</th><th>Tổng nhập</th><th>Tổng xuất</th><th>Chênh lệch</th><th>Số lần điều chỉnh</th>'
      + '</tr></thead><tbody>';
    for (var m = 1; m <= 12; m++) {
      var md = months.find(function(x) { return x.month === m; }) || { totalImport: 0, totalExport: 0, adjustmentCount: 0 };
      var net = md.totalImport - md.totalExport;
      html += '<tr><td>' + monthNames[m] + '</td><td>' + md.totalImport + '</td><td>' + md.totalExport
        + '</td><td>' + (net >= 0 ? "+" : "") + net + '</td><td>' + md.adjustmentCount + '</td></tr>';
    }
    html += '</tbody></table>';

    html += '<h3 style="margin:24px 0 8px;">Tổng hợp theo sản phẩm</h3>';
    html += '<table class="data-table"><thead><tr>'
      + '<th>Sản phẩm</th><th>Tổng tồn kho</th><th>Số mẫu mã</th>'
      + '</tr></thead><tbody>';
    var filterSelect = $("dashboard-product-filter");
    filterSelect.innerHTML = '<option value="">Tất cả</option>';
    products.forEach(function(p) {
      html += '<tr><td>' + escapeHtml(p.productName) + '</td><td>' + p.totalStock + '</td><td>' + p.variantCount + '</td></tr>';
      var opt = document.createElement("option");
      opt.value = p.productId;
      opt.textContent = p.productName;
      filterSelect.appendChild(opt);
    });
    html += '</tbody></table>';

    $("dashboard-content").innerHTML = html;
  }

  // ---------- Init ----------
  var savedToken = null;
  try { savedToken = localStorage.getItem("sessionToken"); } catch(ex) {}
  if (savedToken) {
    callApi("validateSession", { token: savedToken })
      .then(function(result) {
        if (result.valid) {
          sessionToken = savedToken;
          $("view-login").style.display = "none";
          $("app-shell").style.display = "block";
          showView("view-products");
          loadProducts();
        } else {
          try { localStorage.removeItem("sessionToken"); } catch(ex) {}
          $("view-login").style.display = "flex";
        }
      })
      .catch(function() {
        try { localStorage.removeItem("sessionToken"); } catch(ex) {}
        $("view-login").style.display = "flex";
      });
  } else {
    $("view-login").style.display = "flex";
  }

})();
