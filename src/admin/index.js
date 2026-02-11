/**
 * Admin Dashboard, Status & Application Details – single entry point
 * Import dashboard, status, and admindetails from here.
 */

export { DASHBOARD, PATHS, KPI_KEYS, api as dashboardApi } from "./dashboard.js";
export {
  STATUS_SECTION,
  FILTER_OPTIONS,
  TABLE_COLUMNS,
  statusLabel,
  toTableRow,
  api as statusApi,
} from "./status.js";
export {
  APPLICATION_DETAILS,
  formatDisplayId,
  toDetailView,
  api as admindetailsApi,
} from "./admindetails.js";
