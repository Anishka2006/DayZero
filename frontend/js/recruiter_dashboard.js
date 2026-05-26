// Clean up external script to prevent hardcoding issues
(function() {
  const user = JSON.parse(localStorage.getItem("user"));
  const recruiter = JSON.parse(localStorage.getItem("recruiter"));
  
  if (user || recruiter) {
    const data = user || recruiter;
    const name = data.name || data.recruiterName || "Saavi";
    const initials = data.initials || data.recruiterInitials || "S";
    const role = data.role === "recruiter" ? "Senior Recruiter" : (data.role || "Recruiter");
    const companyName = data.company || data.companyName || "LinkedIn";

    if (document.getElementById("recruiterName")) {
      document.getElementById("recruiterName").innerText = name;
    }
    if (document.getElementById("recruiterRole")) {
      document.getElementById("recruiterRole").innerText = `${role} • ${companyName}`;
    }
    if (document.getElementById("recruiterAvatar")) {
      document.getElementById("recruiterAvatar").innerText = initials;
    }
  }
})();