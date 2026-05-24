// mockProjects.js
// Sample project data for multiple companies to demonstrate project separation.
// Each project conforms strictly to the requested schema: id, title, description, techStack, deadline, status, createdAt, companyId.

const mockProjects = [
  {
    id: 1,
    title: "AI Resume Screener",
    description: "Automate initial candidate screening using LLMs to extract key skill scores.",
    techStack: "React, Python, OpenAI, MongoDB",
    deadline: "2026-06-30",
    status: "Active",
    createdAt: "2026-05-15",
    companyId: "google"
  },
  {
    id: 2,
    title: "Cloud Hiring Portal",
    description: "Scalable candidate assessment portal deployed on AWS infrastructure.",
    techStack: "Next.js, Node.js, AWS Lambda, PostgreSQL",
    deadline: "2026-07-15",
    status: "Planning",
    createdAt: "2026-05-20",
    companyId: "amazon"
  },
  {
    id: 3,
    title: "Mobile Dev Candidate Tracker",
    description: "Custom internal applicant tracking system for the mobile engineering team.",
    techStack: "React Native, Express, Firebase",
    deadline: "2026-06-10",
    status: "Completed",
    createdAt: "2026-04-01",
    companyId: "google"
  },
  {
    id: 4,
    title: "Real-time Coding Arena",
    description: "Collaborative platform for live technical coding interviews.",
    techStack: "Vue.js, WebSockets, Redis, Docker",
    deadline: "2026-08-01",
    status: "Active",
    createdAt: "2026-05-22",
    companyId: "netflix"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { mockProjects };
} else {
  window.mockProjects = mockProjects;
}
