// Curated requirement data for the compliance rules engine
// Each set corresponds to a jurisdiction + permit type combination

export type RequirementData = {
  requirementType: string;
  description: string;
  sourceUrl: string;
  sourceText: string;
  reasoning: string;
};

// Boston building permit
export const BOSTON_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "isd_portal_registration",
    description: "Register and submit application via Boston ISD online portal",
    sourceUrl: "https://onlinepermitsandlicenses.boston.gov/isdpermits/",
    sourceText: "Register at Boston ISD portal — determine which permits you need",
    reasoning: "All permit applications must be submitted through the Boston ISD online portal.",
  },
  {
    requirementType: "project_plans",
    description: "Project plans — detailed drawings or blueprints",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Project plans — detailed drawings or blueprints required",
    reasoning: "ISD requires detailed drawings to review structural and zoning compliance.",
  },
  {
    requirementType: "construction_cost_estimate",
    description: "Estimated construction cost",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Estimated construction cost required",
    reasoning: "Construction cost determines permit fee calculations ($50–$100 per $1,000).",
  },
  {
    requirementType: "property_information",
    description: "Property information (address, owner info, authorization to work)",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Property information including address, owner info, and authorization to work",
    reasoning: "Required to verify ownership and authorization for permit issuance.",
  },
  {
    requirementType: "contractor_information",
    description: "Contractor information (names and license numbers of all contractors)",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Contractor information including names and license numbers of all contractors",
    reasoning: "All contractors must be licensed in Massachusetts to perform construction work.",
  },
  {
    requirementType: "zoning_information",
    description: "Zoning information (required if changing use or building near property lines)",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Zoning information required if changing use or building near property lines",
    reasoning: "Boston Zoning Code compliance must be verified before permit issuance.",
  },
];

// Boston trade permits (electrical / plumbing / gas / mechanical)
export const BOSTON_TRADE_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "separate_trade_permits",
    description: "Each trade (electrical, plumbing, gas, mechanical) requires a SEPARATE licensed contractor permit",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/what-building-permit-do-i-need",
    sourceText: "Trade permits are SEPARATE for each trade in Massachusetts — each submitted by a licensed contractor",
    reasoning: "Massachusetts 780 CMR requires separate trade permits for each licensed trade — the GC cannot bundle these.",
  },
  {
    requirementType: "licensed_trade_contractor",
    description: "Trade permit must be filed by the licensed contractor performing the work (e.g., licensed electrician files electrical permit)",
    sourceUrl: "https://www.mass.gov/info-details/check-a-license",
    sourceText: "Each trade permit must be submitted by a licensed contractor in that specific trade",
    reasoning: "Only the licensed trade contractor can pull the permit — not the general contractor.",
  },
  {
    requirementType: "workers_compensation",
    description: "Workers' Compensation insurance certificate",
    sourceUrl: "https://www.boston.gov/departments/inspectional-services/how-get-demolition-permit",
    sourceText: "Workers Compensation Form required for all licensed contractors",
    reasoning: "Massachusetts requires all contractors to carry Workers' Compensation insurance.",
  },
  {
    requirementType: "contractor_license",
    description: "Valid Massachusetts trade license (e.g., electrician license, master plumber license)",
    sourceUrl: "https://www.mass.gov/info-details/check-a-license",
    sourceText: "Copy of contractor license required",
    reasoning: "Contractor must hold a current, valid Massachusetts license for the specific trade.",
  },
  {
    requirementType: "isd_portal_application",
    description: "Submit trade permit application via Boston ISD portal",
    sourceUrl: "https://onlinepermitsandlicenses.boston.gov/isdpermits/",
    sourceText: "All permit applications submitted through Boston ISD online portal",
    reasoning: "Trade permits must be applied for online through the Boston ISD permitting system.",
  },
];

// Cambridge building permit
export const CAMBRIDGE_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "cambridge_portal_application",
    description: "Submit building permit application via Cambridge OpenGov portal",
    sourceUrl: "https://cambridgema.portal.opengov.com",
    sourceText: "Submit building permit application through Cambridge OpenGov portal",
    reasoning: "Cambridge processes all permit applications through the OpenGov online portal.",
  },
  {
    requirementType: "drawings_plans_pdf",
    description: "Drawings/plans in PDF format",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Drawings/plans required in PDF format",
    reasoning: "Cambridge ISD requires digital plans submitted in PDF format for plan review.",
  },
  {
    requirementType: "construction_cost_estimate",
    description: "Construction cost estimate",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Construction cost estimate required",
    reasoning: "Permit fees are calculated at $20 per $1,000 of construction cost ($50 minimum).",
  },
  {
    requirementType: "contractor_licenses",
    description: "Contractor and subcontractor licenses",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Contractor and subcontractor licenses required",
    reasoning: "All contractors and subcontractors must hold current Massachusetts licenses.",
  },
  {
    requirementType: "energy_compliance_forms",
    description: "Energy compliance forms (required for new construction and major renovations)",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Energy compliance forms required for new construction/renovation",
    reasoning: "Cambridge enforces the Massachusetts Stretch Energy Code for new construction and major renovations.",
  },
  {
    requirementType: "zoning_compliance",
    description: "Zoning compliance verification per Cambridge zoning ordinance",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Zoning compliance required per Cambridge zoning ordinance",
    reasoning: "All projects must comply with Cambridge zoning regulations before permit issuance.",
  },
  {
    requirementType: "historical_review",
    description: "Historical Commission approval (required for work in historic or conservation districts)",
    sourceUrl: "https://www.cambridgema.gov/services/buildingpermits",
    sourceText: "Historical Commission approval required for work in historic/conservation districts or designated landmarks",
    reasoning: "Cambridge has numerous historic districts requiring Historical Commission review.",
  },
];

// Brookline building permit
export const BROOKLINE_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "accela_portal_application",
    description: "Submit application via Brookline Accela online portal",
    sourceUrl: "https://aca-prod.accela.com/BROOKLINE/Default.aspx",
    sourceText: "Permit applications submitted through Brookline Accela online portal",
    reasoning: "All Brookline building permit applications must be submitted online via Accela.",
  },
  {
    requirementType: "site_architectural_plans",
    description: "Site or architectural plans (PDF format)",
    sourceUrl: "https://aca-prod.accela.com/BROOKLINE/Default.aspx",
    sourceText: "Site or architectural plans required in PDF format",
    reasoning: "Brookline Building Department requires plans for review before permit issuance.",
  },
  {
    requirementType: "scope_valuation",
    description: "Scope of work and valuation estimate",
    sourceUrl: "https://www.brooklinema.gov/183/Permit-Fee-Schedule",
    sourceText: "Scope of work and valuation estimate required",
    reasoning: "Permit fees are calculated at $20 per $1,000 of construction valuation.",
  },
  {
    requirementType: "contractor_licenses",
    description: "CSL (Construction Supervisor License) and/or HIC (Home Improvement Contractor Registration)",
    sourceUrl: "https://www.brooklinema.gov/186/FAQ",
    sourceText: "CSL and/or HIC required",
    reasoning: "Massachusetts requires a Construction Supervisor License for all structural work.",
  },
  {
    requirementType: "energy_code_compliance",
    description: "Energy code compliance documentation (REScheck or COMcheck)",
    sourceUrl: "https://www.brooklinema.gov/186/FAQ",
    sourceText: "Energy code compliance documentation (REScheck or COMcheck) required",
    reasoning: "Brookline enforces strict energy codes — REScheck (residential) or COMcheck (commercial) required.",
  },
];

// Salem building permit
export const SALEM_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "salem_application",
    description: "Building permit application via Salem Inspectional Services Department",
    sourceUrl: "https://www.salemma.gov/318/Inspectional-Services-Building-Departmen",
    sourceText: "Applications submitted through Salem Inspectional Services Department",
    reasoning: "All permit applications must be submitted to the Salem Inspectional Services Department.",
  },
  {
    requirementType: "architectural_plans",
    description: "Architectural and/or site plans",
    sourceUrl: "https://www.salemma.gov/318/Inspectional-Services-Building-Departmen",
    sourceText: "Architectural and/or site plans required",
    reasoning: "Plans required for plan review to ensure compliance with 780 CMR building code.",
  },
  {
    requirementType: "project_cost_estimate",
    description: "Total project cost estimate (determines permit fee)",
    sourceUrl: "https://www.salemma.gov/318/Inspectional-Services-Building-Departmen",
    sourceText: "Total project cost estimate required for fee calculation",
    reasoning: "Salem permit fees: $75 base + $15 per $1,000 (residential) or $20 per $1,000 (commercial).",
  },
  {
    requirementType: "contractor_license",
    description: "Massachusetts Construction Supervisor License (CSL)",
    sourceUrl: "https://www.salemma.gov/318/Inspectional-Services-Building-Departmen",
    sourceText: "Massachusetts-licensed contractor required",
    reasoning: "All structural work in Massachusetts requires a licensed Construction Supervisor.",
  },
  {
    requirementType: "historic_review",
    description: "Historic District Commission review (Salem has numerous historic districts)",
    sourceUrl: "https://www.salemma.gov/318/Inspectional-Services-Building-Departmen",
    sourceText: "Many properties in Salem are under historic preservation rules",
    reasoning: "Salem has extensive historic districts — HDC review required before permits for many properties.",
  },
];

// Lowell building permit
export const LOWELL_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "lowell_portal_application",
    description: "Submit application via Lowell online permitting portal",
    sourceUrl: "https://www.lowellma.gov/1631/Online-Permitting",
    sourceText: "Building permit applications submitted through Lowell online permitting",
    reasoning: "Lowell processes permit applications through its online portal.",
  },
  {
    requirementType: "building_permit_checklist",
    description: "Complete Lowell Building Permit Checklist",
    sourceUrl: "http://lowellma.gov/DocumentCenter/View/1013/Buiding-Permit-Check-List-PDF",
    sourceText: "Building Permit Checklist required",
    reasoning: "Lowell requires its checklist to ensure all required documents are included in the application.",
  },
  {
    requirementType: "plans_specifications",
    description: "Plans and specifications for the proposed work",
    sourceUrl: "https://www.lowellma.gov/687/Apply-for-Permits",
    sourceText: "Plans and specifications required",
    reasoning: "Plans must be provided to the Development Services Division for review.",
  },
  {
    requirementType: "project_valuation",
    description: "Project valuation estimate",
    sourceUrl: "https://www.lowellma.gov/613/Building-Permit-Fees",
    sourceText: "Project valuation required for fee calculation",
    reasoning: "Lowell fees: $50 up to $1,000 value, then $10 per additional $1,000.",
  },
  {
    requirementType: "contractor_license",
    description: "Massachusetts licensed contractor (CSL)",
    sourceUrl: "https://www.lowellma.gov/687/Apply-for-Permits",
    sourceText: "Licensed contractor required for all structural work",
    reasoning: "All structural work requires a Massachusetts-licensed Construction Supervisor.",
  },
  {
    requirementType: "trades_checklist",
    description: "Trades Checklist (if electrical, plumbing, or mechanical work is included)",
    sourceUrl: "http://lowellma.gov/DocumentCenter/View/13461/requirements-for-applications---clerks-check-list",
    sourceText: "Trades checklist required for trade work",
    reasoning: "Separate trade permits and documentation required for each licensed trade.",
  },
];

// Springfield building permit
export const SPRINGFIELD_BUILDING_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "springfield_application",
    description: "Building permit application via Springfield Building Department",
    sourceUrl: "https://ecode360.com/15362007",
    sourceText: "Applications submitted to Springfield Building Department per City Ordinance § 175",
    reasoning: "All permits must be obtained from Springfield Building Department per Springfield City Ordinance § 175.",
  },
  {
    requirementType: "project_plans",
    description: "Detailed project plans",
    sourceUrl: "https://ecode360.com/15362007",
    sourceText: "Detailed project plans required per 780 CMR § 105.1",
    reasoning: "Plans required to verify compliance with Massachusetts State Building Code (780 CMR).",
  },
  {
    requirementType: "project_valuation",
    description: "Project valuation for fee calculation",
    sourceUrl: "https://www.springfield-ma.gov/code/fileadmin/forms/Building_Permit_Fee_Schedule_07-16-2012.pdf",
    sourceText: "Project valuation required",
    reasoning: "Springfield residential fees: $250 min or $8 per $1,000; commercial: $100 min or $12 per $1,000.",
  },
  {
    requirementType: "contractor_license",
    description: "Massachusetts licensed contractor documentation",
    sourceUrl: "https://ecode360.com/15362007",
    sourceText: "Licensed contractor required",
    reasoning: "780 CMR requires licensed Construction Supervisors for all structural work.",
  },
  {
    requirementType: "insurance_certificates",
    description: "Insurance certificates (Workers' Compensation and liability)",
    sourceUrl: "https://ecode360.com/15362007",
    sourceText: "Insurance certificates required",
    reasoning: "Massachusetts law requires Workers' Compensation and liability insurance for all contractors.",
  },
];

// Massachusetts state-wide (default fallback)
export const MA_STATE_REQUIREMENTS: RequirementData[] = [
  {
    requirementType: "application_with_jurisdiction",
    description: "Completed application with your local city/town building department",
    sourceUrl: "https://www.mass.gov/massachusetts-state-building-code-780-cmr",
    sourceText: "Determine jurisdiction — each city/town building department administers 780 CMR locally",
    reasoning: "Massachusetts 780 CMR is administered locally — contact your city/town building department.",
  },
  {
    requirementType: "sealed_plans",
    description: "Sealed architectural/structural plans from Massachusetts-licensed professionals",
    sourceUrl: "https://www.mass.gov/massachusetts-state-building-code-780-cmr",
    sourceText: "Sealed plans from MA-licensed professionals required per 780 CMR",
    reasoning: "Massachusetts Building Code requires stamped/sealed plans from licensed architects or engineers.",
  },
  {
    requirementType: "asbestos_abatement_docs",
    description: "Asbestos abatement documentation (required for demolition or renovation work)",
    sourceUrl: "https://www.mass.gov/orgs/massachusetts-department-of-environmental-protection",
    sourceText: "Asbestos abatement required per MassDEP regulations",
    reasoning: "Strict asbestos abatement requirements overseen by local building departments AND MassDEP.",
  },
  {
    requirementType: "dig_safe",
    description: "Dig Safe notification — call 811 (required by state law before any ground disturbance)",
    sourceUrl: "https://www.digsafe.com",
    sourceText: "Dig Safe notification required by state law before any ground disturbance",
    reasoning: "Massachusetts law requires Dig Safe notification (811) before any excavation.",
  },
  {
    requirementType: "contractor_license",
    description: "Massachusetts Construction Supervisor License (CSL)",
    sourceUrl: "https://www.mass.gov/info-details/check-a-license",
    sourceText: "CSL required for all structural work under 780 CMR",
    reasoning: "All structural work in Massachusetts requires a licensed Construction Supervisor.",
  },
  {
    requirementType: "energy_code_compliance",
    description: "Energy code compliance — IECC + potentially Massachusetts Stretch Energy Code",
    sourceUrl: "https://www.mass.gov/massachusetts-state-building-code-780-cmr",
    sourceText: "Massachusetts enforces IECC; many cities also enforce Stretch Energy Code",
    reasoning: "Massachusetts enforces IECC energy code; many municipalities also require Stretch Code compliance.",
  },
  {
    requirementType: "trade_permits_separate",
    description: "Separate trade permits required for each trade (electrical, plumbing, gas, mechanical, fire)",
    sourceUrl: "https://www.mass.gov/massachusetts-state-building-code-780-cmr",
    sourceText: "Trade permits SEPARATE for each trade — each submitted by a licensed contractor in that field",
    reasoning: "780 CMR requires separate trade permits submitted by the licensed contractor for each trade.",
  },
  {
    requirementType: "insurance_certificates",
    description: "Insurance certificates (Workers' Compensation required by Massachusetts law)",
    sourceUrl: "https://www.mass.gov/info-details/workers-compensation-insurance",
    sourceText: "Workers Compensation insurance required by Massachusetts law",
    reasoning: "Massachusetts requires all contractors to carry Workers' Compensation insurance.",
  },
];
