// mockAuth.js
// Mock user authentication configuration for prototype recruiter dashboard.
// Depend only on companyId for visibility and separation of projects.

const mockUser = {
  companyId: "google",
  companyName: "Google",
  recruiterName: "Sarah Johnson",
  recruiterRole: "Senior Recruiter"
};

// Make available globally in browser or through CommonJS if compiled/run in Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = { mockUser };
} else {
  window.mockUser = mockUser;
}
