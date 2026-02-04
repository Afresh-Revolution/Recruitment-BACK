import { isValidCompany } from "../constants/companies.js";

export function validateCompany(req, res, next) {
  const company = req.body.company;

  if (!company) {
    return res.status(400).json({
      ok: false,
      error: {
        message: "Company is required"
      }
    });
  }

  if (!isValidCompany(company)) {
    return res.status(400).json({
      ok: false,
      error: {
        message: "Invalid company. Must be either 'company_a' or 'company_b'"
      }
    });
  }

  next();
}

