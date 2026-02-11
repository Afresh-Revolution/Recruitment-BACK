/**
 * Admin Dashboard (C.A.G.E) – config and API helpers.
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
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch summary");
      return json;
    },
    async downloadCsv(token, companyId = null) {
      const url = new URL(`${baseURL}${PATHS.exportCsv}`);
      if (companyId) url.searchParams.set("companyId", companyId);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const d = res.headers.get("Content-Disposition");
      const filename = (d && d.match(/filename="?([^";]+)"?/)?.[1]) || `applications-${new Date().toISOString().slice(0, 10)}.csv`;
      return { blob, filename };
    },
  };
}

export { DASHBOARD, PATHS, KPI_KEYS, api };
