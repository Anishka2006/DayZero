const recruiterData = {
    name: "Anil Patel",
    role: "Senior Recruiter",
    company: "Google"
};

localStorage.setItem(
    "recruiter",
    JSON.stringify(recruiterData)
);

const recruiter =
    JSON.parse(localStorage.getItem("recruiter"));

if(recruiter){

    document.getElementById("recruiterName").innerText =
        recruiter.name;

    document.getElementById("recruiterRole").innerText =
        `${recruiter.role} · ${recruiter.company}`;

    const initials = recruiter.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();

    document.getElementById("recruiterAvatar").innerText =
        initials;
}