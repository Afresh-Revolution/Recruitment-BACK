/**
 * Application Details – admin dashboard modal/detail view.
 * Name: "Application Details" (ID, status, applicant info, position, documents, Mark as Reviewed).
 */

const APPLICATION_DETAILS = {
  name: "Application Details",
  idLabel: "ID",
  currentStatusLabel: "Current Status",
  appliedOnLabel: "Applied On",
  applicantInfoTitle: "Applicant Information",
  fullNameLabel: "FULL NAME",
  emailLabel: "EMAIL ADDRESS",
  positionDetailsTitle: "Position Details",
  roleLabel: "ROLE",
  companyLabel: "COMPANY",
  documentsTitle: "Documents",
  closeButton: "Close",
  markAsReviewedButton: "Mark as Reviewed",
};

/** Format display ID from backend _id (e.g. APP-002 or use short id) */
function formatDisplayId(id) {
  if (!id) return "—";
  const str = typeof id === "string" ? id : id.toString();
  const short = str.slice(-6).toUpperCase();
  return `APP-${short}`;
}

/** Map API application to detail view shape for the modal */
function toDetailView(app) {
  const fullName = app.data?.fullName ?? app.data?.name ?? "";
  const email = app.data?.email ?? "";
  const documents = app.data?.resumeUrl
    ? [{ name: "Resume.pdf", url: app.data.resumeUrl, type: "PDF Document" }]
    : (app.data?.documents || []).map((d) => ({
        name: d.name || d.filename || "Document",
        url: d.url || d.path,
        type: d.type || "Document",
      }));
  return {
    id: app._id,
    displayId: formatDisplayId(app._id),
    status: app.status,
    appliedOn: app.createdAt,
    applicant: { fullName, email },
    role: app.roleId?.title ?? "",
    company: app.companyId?.name ?? "",
    companyId: app.companyId?._id,
    roleId: app.roleId?._id,
    documents,
    reviewedAt: app.reviewedAt,
  };
}

/**
 * @param {string} baseURL - e.g. "https://your-api.onrender.com" or "http://localhost:5000"
 */
function api(baseURL) {
  return {
    async getApplication(token, applicationId) {
      const res = await fetch(`${baseURL}/api/admin/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Application not found");
      return { ...json, data: toDetailView(json.data) };
    },

    async markAsReviewed(token, applicationId, message = null) {
      const res = await fetch(`${baseURL}/api/admin/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "reviewed", ...(message && { message }) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      return json;
    },
  };
}

export { APPLICATION_DETAILS, formatDisplayId, toDetailView, api };
