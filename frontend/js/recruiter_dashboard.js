// Clean up external script to prevent hardcoding issues
(function() {
  const recruiter = JSON.parse(localStorage.getItem("recruiter"));
  if (recruiter) {
    const name = recruiter.recruiterName || recruiter.name || "Saavi";
    const initials = recruiter.initials || recruiter.recruiterInitials || "S";
    const role = recruiter.role || "Senior Recruiter";
    const companyName = recruiter.companyName || recruiter.company || "LinkedIn";

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