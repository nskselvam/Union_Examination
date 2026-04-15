// Route definitions for reference and validation
// This file helps ensure all menu items have corresponding routes

export const ROUTE_DEFINITIONS = {
  // Authentication & User Management
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  PROFILE: '/profile',
  
  // Dashboards
  COMMON_DASHBOARD: '/common/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  
  // Utilities
  ADMIN_WINDOW: '/admin/admin-window',
  
  // Examiner
  EXAMINER_REVIEW: '/examiner/review',
  EXAMINER_REVIEW_VALUATION: '/examiner/reviewe/valuationreview',
  EXAMINER_RESET_PASSWORD: '/examiner/resetpassword',
  EXAMINER_USER_PASSWORD: '/examiner/userpassword',
  EXAMINER_PAYMENT_REPORT: '/Evaluator/examiner-payment-report',
  EVALUATOR_PRINT_PDF: '/Evaluator/PrintPdf',
  EVALUATOR_PAYMENT: '/Evaluator/Payment',
  
  // Alteration
  EXAMINER_ALTERATION: '/examiner_alteration',
  CHIEF_EXAMINER_ALTERATION: '/chief_examiner_alteration',
  
  // Paper Review
  PAPER_REVIEW_DATA: '/paper-review-data',
  PAPER_REVIEW_ZERO: '/paper-review-zero',
  
  // Valuation Paper Checking
  // (Add specific route if exists)
  
  // Export Data
  DATA_EXPORT: '/admin/export-data',
  
  // Valuation Move
  VALUATION_MOVE: '/admin/valuation-move',
  VALUATION_CANCEL: '/admin/valuation-cancel',
  
  // Data Backup
  DATA_BACKUP: '/admin/data-backup',
  
  // Navbar/Roll Management
  ADMIN_ROLL_UPDATE: '/admin/admin-rollupdate',
  NAVBAR_ADD: '/admin/navbaradd',
  ROLL_MASTER: '/admin/rollmaster',
  EXAMINER_ROLL_UPDATE: '/admin/examinerrollupdate',
  
  // Chief Remarks
  CHIEF_REMARKS: '/chiefRemarks',
  
  // User Roll
  USER_ROLL_MASTER: '/admin/admin-rollupdate',
}

// Group routes by menu category for easier reference
export const ROUTE_GROUPS = {
  utilities: [
    ROUTE_DEFINITIONS.ADMIN_WINDOW,
  ],
  
  navbarRoll: [
    ROUTE_DEFINITIONS.ADMIN_ROLL_UPDATE,
    ROUTE_DEFINITIONS.NAVBAR_ADD,
    ROUTE_DEFINITIONS.ROLL_MASTER,
    ROUTE_DEFINITIONS.EXAMINER_ROLL_UPDATE,
  ],
}

// Helper function to check if a route exists
export const isValidRoute = (path) => {
  return Object.values(ROUTE_DEFINITIONS).includes(path)
}

// Helper function to get route category
export const getRouteCategory = (path) => {
  for (const [category, routes] of Object.entries(ROUTE_GROUPS)) {
    if (routes.includes(path)) {
      return category
    }
  }
  return null
}

export default ROUTE_DEFINITIONS
