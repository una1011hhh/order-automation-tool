const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { checkDuplicate, createOrder, listOrders } = require("./lib/orderStore");

const rootDir = __dirname;
const requestedPort = Number(process.env.PORT || 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, statusCode, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  send(res, statusCode, JSON.stringify(payload), "application/json; charset=utf-8");
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function getFilters(url) {
  return {
    orderId: url.searchParams.get("orderId") || "",
    email: url.searchParams.get("email") || "",
    workflow: url.searchParams.get("workflow") || "",
    status: url.searchParams.get("status") || ""
  };
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function ordersToCsv(orders) {
  const headers = [
    "Order ID",
    "Status",
    "Workflow",
    "Customer",
    "Email",
    "Phone",
    "Product",
    "Machine SN",
    "Original Order No",
    "Duplicate Risk",
    "Created At"
  ];
  const rows = orders.map((order) => [
    order.id,
    order.status,
    order.workflowLabel || order.workflow,
    order.customer.name,
    order.customer.email,
    order.customer.phone,
    [order.product.name, order.product.model].filter(Boolean).join(" / "),
    order.product.machineSn,
    order.product.orderNo,
    order.duplicateRisk ? `${order.duplicateRiskLevel} Risk Duplicate` : "",
    order.createdAt
  ]);
  return [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

async function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const fullPath = path.join(rootDir, filePath);
  try {
    const body = await fs.readFile(fullPath);
    send(res, 200, body, contentTypes[ext] || "application/octet-stream");
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

async function handleApi(req, res, url) {
  if (req.method === "POST" && url.pathname === "/api/orders") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const order = await createOrder(payload);
      sendJson(res, 201, { order });
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid order payload" });
    }
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/orders") {
    const orders = await listOrders(getFilters(url));
    sendJson(res, 200, { orders });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/orders/check-duplicate") {
    const result = await checkDuplicate({
      email: url.searchParams.get("email") || "",
      address: url.searchParams.get("address") || "",
      workflow: url.searchParams.get("workflow") || "",
      machineSn: url.searchParams.get("machineSn") || "",
      issueDescription: url.searchParams.get("issueDescription") || ""
    });
    sendJson(res, 200, result);
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/orders/export.csv") {
    const orders = await listOrders(getFilters(url));
    res.writeHead(200, {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"orders.csv\""
    });
    res.end(ordersToCsv(orders));
    return true;
  }

  return false;
}

function createServer() {
  return http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (await handleApi(req, res, url)) return;

    if (req.method !== "GET") {
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      await serveStatic(res, "index.html");
      return;
    }

    if (url.pathname === "/admin/orders") {
      await serveStatic(res, path.join("admin", "orders.html"));
      return;
    }

    if (url.pathname.startsWith("/admin/")) {
      await serveStatic(res, url.pathname.slice(1));
      return;
    }

    send(res, 404, "Not found", "text/plain; charset=utf-8");
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
  });
}

function listenWithFallback(port, attemptsLeft = 10) {
  const server = createServer();
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = port + 1;
      server.close();
      console.log(`Port ${port} is busy. Trying ${nextPort}...`);
      listenWithFallback(nextPort, attemptsLeft - 1);
      return;
    }
    throw error;
  });

  server.listen(port, () => {
    console.log(`Order automation tool running at http://localhost:${port}`);
    console.log(`Admin orders page available at http://localhost:${port}/admin/orders`);
  });
}

listenWithFallback(requestedPort);
