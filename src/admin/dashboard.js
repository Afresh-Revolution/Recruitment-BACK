/**
 * Admin Dashboard (C.A.G.E)
 * Name: "Admin Dashboard" – Manage and review job applications.
 * Use with baseURL (e.g. your API origin) and admin token from login.
 */

const DASHBOARD = {
  name: "Admin Dashboard",
  subtitle: "Manage and review job applications",
};

const PATHS = {
  login: "/api/admin/login",
  summary: "/api/admin/applications/summary",
  exportCsv: "/api/admin/applications/export-csv",
};

const KPI_KEYS = {
  total: "total",
  pending: "pending",
  interviewing: "interviewing",
  hired: "hired",
};

/**
 * @param {string} baseURL - e.g. "https://your-api.onrender.com" or "http://localhost:5000"
 */
function api(baseURL) {
  return {
    async login(email, password) {
      const res = await fetch(`${baseURL}${PATHS.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");
      return json;
    },

    async getSummary(token, companyId = null) {
      const url = new URL(`${baseURL}${PATHS.summary}`);
      if (companyId) url.searchParams.set("companyId", companyId);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch summary");
      return json;
    },

    async downloadCsv(token, companyId = null) {
      const url = new URL(`${baseURL}${PATHS.exportCsv}`);
      if (companyId) url.searchParams.set("companyId", companyId);
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Export failed");
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition && disposition.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1] : `admin-dashboard-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      return { blob, filename };
    },
  };
}

export { DASHBOARD, PATHS, KPI_KEYS, api };
