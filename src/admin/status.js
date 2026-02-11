/**
 * Status section of the Admin Dashboard
 * Name: "Status" – table of applicants with search and status filter.
 */

const STATUS_SECTION = {
  name: "Status",
  searchPlaceholder: "Search by applicant, role, or company...",
};

const FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "interviewing", label: "Interviewing" },
  { value: "hired", label: "Accepted" }, // UI "Accepted" = backend "hired" or "approved"
  { value: "approved", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const TABLE_COLUMNS = [
  { key: "applicant", header: "APPLICANT" },
  { key: "role", header: "ROLE" },
  { key: "company", header: "COMPANY" },
  { key: "dateApplied", header: "DATE APPLIED" },
  { key: "status", header: "STATUS" },
];

/** Map backend status to display label */
function statusLabel(status) {
  if (status === "hired" || status === "approved") return "Accepted";
  if (status === "pending") return "Pending";
  if (status === "reviewed") return "Reviewed";
  if (status === "interviewing") return "Interviewing";
  if (status === "rejected") return "Rejected";
  return status || "Pending";
}

/** Build one table row from API application document */
function toTableRow(app) {
  const name = app.data?.fullName ?? app.data?.name ?? "";
  const email = app.data?.email ?? "";
  return {
    _id: app._id,
    applicant: { name, email },
    role: app.roleId?.title ?? "",
    company: app.companyId?.name ?? "",
    dateApplied: app.createdAt,
    status: app.status,
    statusLabel: statusLabel(app.status),
    reviewedAt: app.reviewedAt,
  };
}

/**
 * @param {string} baseURL - e.g. "https://your-api.onrender.com" or "http://localhost:5000"
 */
function api(baseURL) {
  return {
    async getApplications(token, { companyId = null, status = null, search = null } = {}) {
      const url = new URL(`${baseURL}/api/admin/applications`);
      if (companyId) url.searchParams.set("companyId", companyId);
      if (status) url.searchParams.set("status", status);
      if (search && String(search).trim()) url.searchParams.set("search", String(search).trim());
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch applications");
      return {
        ...json,
        data: (json.data || []).map(toTableRow),
      };
    },

    async setApplicationStatus(token, applicationId, status, message = null) {
      const res = await fetch(`${baseURL}/api/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ...(message && { message }) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      return json;
    },
  };
}

export {
  STATUS_SECTION,
  FILTER_OPTIONS,
  TABLE_COLUMNS,
  statusLabel,
  toTableRow,
  api,
};
