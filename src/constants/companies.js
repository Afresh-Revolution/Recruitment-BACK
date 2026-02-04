export const COMPANIES = {
  COMPANY_A: "company_a",
  COMPANY_B: "company_b"
};

export const VALID_COMPANIES = [COMPANIES.COMPANY_A, COMPANIES.COMPANY_B];

export function isValidCompany(company) {
  return VALID_COMPANIES.includes(company);
}

