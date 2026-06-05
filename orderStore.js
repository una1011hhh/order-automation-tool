<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Orders - Order Automation Tool</title>
  <style>
    :root {
      --bg: #f7f1eb;
      --panel: #ffffff;
      --text: #121016;
      --muted: #7d746c;
      --line: #eadfd4;
      --primary: #121016;
      --warning: #b56b19;
      --success: #1f8f68;
      --danger: #d84b63;
      --radius: 8px;
      --shadow: 0 16px 38px rgba(83, 61, 43, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
      color: var(--text);
      background: linear-gradient(180deg, #fffaf4 0%, var(--bg) 58%, #f2e9df 100%);
    }

    .shell {
      width: min(100% - 40px, 1280px);
      margin: 0 auto;
      padding: 26px 0 42px;
    }

    .topbar,
    .panel {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      padding: 22px 24px;
      margin-bottom: 16px;
    }

    .topbar-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.1;
    }

    .muted {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 13px;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
      padding: 14px;
      margin-bottom: 16px;
    }

    input,
    select,
    button {
      height: 38px;
      border-radius: var(--radius);
      font: inherit;
    }

    input,
    select {
      width: 100%;
      padding: 8px 10px;
      color: var(--text);
      background: #fffdf9;
      border: 1px solid var(--line);
      outline: none;
    }

    button,
    .link-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 8px 12px;
      color: #fff;
      background: var(--primary);
      border: 0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 750;
      text-decoration: none;
    }

    .link-button.secondary,
    button.secondary {
      color: var(--primary);
      background: #efe7df;
      border: 1px solid var(--line);
    }

    .panel {
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }

    .table-header strong {
      font-size: 14px;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 980px;
      background: #fff;
    }

    th,
    td {
      padding: 11px 12px;
      text-align: left;
      border-bottom: 1px solid var(--line);
      font-size: 12px;
      vertical-align: top;
    }

    th {
      color: #42434d;
      background: #fffaf4;
      font-size: 11px;
      text-transform: uppercase;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      background: #efe7df;
    }

    .badge.Submitted,
    .badge.Processing {
      color: var(--warning);
      background: #fde6c1;
    }

    .badge.Completed {
      color: var(--success);
      background: #daf5e8;
    }

    .badge.Rejected {
      color: var(--danger);
      background: #fff1f2;
    }

    .risk-tag {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 850;
      color: #fff;
      background: var(--warning);
    }

    .risk-tag.High {
      background: var(--danger);
    }

    .risk-tag.Low {
      color: var(--primary);
      background: #efe7df;
    }

    .empty {
      padding: 26px;
      color: var(--muted);
      text-align: center;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .topbar,
      .filters {
        grid-template-columns: 1fr;
      }

      .topbar {
        display: grid;
      }

      .topbar-actions {
        display: grid;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <div>
        <h1 data-i18n="title">已提交订单</h1>
        <p class="muted" data-i18n="subtitle">本地开发用订单后台视图。</p>
      </div>
      <div class="topbar-actions">
        <select id="languageSelect" aria-label="Language">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
        <a class="link-button secondary" href="/" data-i18n="back">返回助手</a>
      </div>
    </header>

    <section class="panel filters" aria-label="Order filters">
      <input id="orderIdFilter" type="search" placeholder="搜索订单号" />
      <input id="emailFilter" type="search" placeholder="搜索客户邮箱" />
      <select id="workflowFilter">
        <option value="" data-i18n="allWorkflows">全部流程</option>
        <option value="repair">Repair Order</option>
        <option value="returnExchange">Return / Exchange Order</option>
        <option value="spareParts">Spare Parts Request</option>
        <option value="replacementShipment">Replacement Shipment</option>
      </select>
      <select id="statusFilter">
        <option value="" data-i18n="allStatuses">全部状态</option>
        <option value="Draft">Draft</option>
        <option value="Submitted">Submitted</option>
        <option value="Processing">Processing</option>
        <option value="Completed">Completed</option>
        <option value="Rejected">Rejected</option>
      </select>
      <button type="button" id="exportBtn" data-i18n="exportCsv">导出 CSV</button>
    </section>

    <section class="panel">
      <div class="table-header">
        <strong id="resultCount">0 orders</strong>
        <button type="button" class="secondary" id="refreshBtn" data-i18n="refresh">刷新</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th data-i18n="orderId">订单号</th>
              <th data-i18n="status">状态</th>
              <th data-i18n="workflow">流程</th>
              <th data-i18n="customer">客户</th>
              <th data-i18n="email">邮箱</th>
              <th data-i18n="phone">电话</th>
              <th data-i18n="product">产品</th>
              <th>SN</th>
              <th data-i18n="sourceOrder">源订单</th>
              <th data-i18n="duplicateRisk">重复风险</th>
              <th data-i18n="created">创建时间</th>
            </tr>
          </thead>
          <tbody id="ordersBody"></tbody>
        </table>
        <div id="emptyState" class="empty" data-i18n="empty">暂无已提交订单。</div>
      </div>
    </section>
  </main>

  <script>
    const translations = {
      zh: {
        title: "已提交订单",
        subtitle: "本地开发用订单后台视图。",
        back: "返回助手",
        allWorkflows: "全部流程",
        allStatuses: "全部状态",
        exportCsv: "导出 CSV",
        refresh: "刷新",
        orderId: "订单号",
        status: "状态",
        workflow: "流程",
        customer: "客户",
        email: "邮箱",
        phone: "电话",
        product: "产品",
        sourceOrder: "源订单",
        duplicateRisk: "重复风险",
        created: "创建时间",
        empty: "暂无已提交订单。",
        orders: "个订单",
        searchOrderId: "搜索订单号",
        searchEmail: "搜索客户邮箱",
        highRisk: "高风险重复",
        mediumRisk: "中风险重复",
        lowRisk: "低风险重复"
      },
      en: {
        title: "Submitted Orders",
        subtitle: "Local development admin view for submitted order records.",
        back: "Back to Assistant",
        allWorkflows: "All workflows",
        allStatuses: "All statuses",
        exportCsv: "Export CSV",
        refresh: "Refresh",
        orderId: "Order ID",
        status: "Status",
        workflow: "Workflow",
        customer: "Customer",
        email: "Email",
        phone: "Phone",
        product: "Product",
        sourceOrder: "Source Order",
        duplicateRisk: "Duplicate Risk",
        created: "Created",
        empty: "No submitted orders yet.",
        orders: "orders",
        searchOrderId: "Search order ID",
        searchEmail: "Search customer email",
        highRisk: "High Risk Duplicate",
        mediumRisk: "Medium Risk Duplicate",
        lowRisk: "Low Risk Duplicate"
      }
    };
    let currentLanguage = localStorage.getItem("order_assistant_language") || "zh";
    const languageSelect = document.getElementById("languageSelect");
    const filters = {
      orderId: document.getElementById("orderIdFilter"),
      email: document.getElementById("emailFilter"),
      workflow: document.getElementById("workflowFilter"),
      status: document.getElementById("statusFilter")
    };
    const ordersBody = document.getElementById("ordersBody");
    const emptyState = document.getElementById("emptyState");
    const resultCount = document.getElementById("resultCount");

    function t(key) {
      return translations[currentLanguage][key] || key;
    }

    function applyLanguage() {
      languageSelect.value = currentLanguage;
      document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
      });
      filters.orderId.placeholder = t("searchOrderId");
      filters.email.placeholder = t("searchEmail");
    }

    function getQueryString() {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, element]) => {
        if (element.value.trim()) params.set(key, element.value.trim());
      });
      return params.toString();
    }

    function restoreFiltersFromUrl() {
      const params = new URLSearchParams(window.location.search);
      Object.entries(filters).forEach(([key, element]) => {
        if (params.has(key)) element.value = params.get(key);
      });
    }

    function text(value) {
      return value || "-";
    }

    function addCell(row, value) {
      const cell = document.createElement("td");
      cell.textContent = text(value);
      row.appendChild(cell);
    }

    function renderOrders(orders) {
      ordersBody.innerHTML = "";
      emptyState.style.display = orders.length ? "none" : "block";
      resultCount.textContent = `${orders.length} ${t("orders")}`;

      orders.forEach((order) => {
        const row = document.createElement("tr");
        const product = [order.product.name, order.product.model].filter(Boolean).join(" / ");
        addCell(row, order.id);
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `badge ${order.status}`;
        statusBadge.textContent = text(order.status);
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        addCell(row, order.workflowLabel || order.workflow);
        addCell(row, order.customer.name);
        addCell(row, order.customer.email);
        addCell(row, order.customer.phone);
        addCell(row, product);
        addCell(row, order.product.machineSn);
        addCell(row, order.product.orderNo);
        const riskCell = document.createElement("td");
        if (order.duplicateRisk) {
          const riskTag = document.createElement("span");
          riskTag.className = `risk-tag ${order.duplicateRiskLevel}`;
          const key = `${String(order.duplicateRiskLevel || "").toLowerCase()}Risk`;
          riskTag.textContent = t(key) || `${order.duplicateRiskLevel} Risk Duplicate`;
          riskCell.appendChild(riskTag);
        } else {
          riskCell.textContent = "-";
        }
        row.appendChild(riskCell);
        addCell(row, new Date(order.createdAt).toLocaleString());
        ordersBody.appendChild(row);
      });
    }

    async function loadOrders() {
      const query = getQueryString();
      const response = await fetch(`/api/orders${query ? `?${query}` : ""}`);
      const data = await response.json();
      renderOrders(data.orders || []);
    }

    function exportCsv() {
      const query = getQueryString();
      window.location.href = `/api/orders/export.csv${query ? `?${query}` : ""}`;
    }

    Object.values(filters).forEach((element) => {
      element.addEventListener("input", loadOrders);
      element.addEventListener("change", loadOrders);
    });
    document.getElementById("refreshBtn").addEventListener("click", loadOrders);
    document.getElementById("exportBtn").addEventListener("click", exportCsv);
    languageSelect.addEventListener("change", () => {
      currentLanguage = languageSelect.value;
      localStorage.setItem("order_assistant_language", currentLanguage);
      applyLanguage();
      loadOrders();
    });
    restoreFiltersFromUrl();
    applyLanguage();
    loadOrders();
  </script>
</body>
</html>
