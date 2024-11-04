// Event listener to show/hide "Other" input field
document.getElementById("emergency-type").addEventListener("change", function () {
    const otherEmergencyGroup = document.getElementById("other-emergency-group");
    if (this.value === "other") {
        otherEmergencyGroup.style.display = "block";
        document.getElementById("other-emergency").required = true;
    } else {
        otherEmergencyGroup.style.display = "none";
        document.getElementById("other-emergency").required = false;
    }
});

// Event listener to toggle "Other" input field visibility
document.getElementById("emergency-type").addEventListener("change", function () {
    const otherEmergencyGroup = document.getElementById("other-emergency-group");
    if (this.value === "other") {
        otherEmergencyGroup.style.display = "block";
        document.getElementById("other-emergency").required = true;
    } else {
        otherEmergencyGroup.style.display = "none";
        document.getElementById("other-emergency").required = false;
    }
});

document.getElementById("emergency-form").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const requiredFields = document.querySelectorAll("#emergency-form [required]");
    let allFilled = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            allFilled = false;
            field.classList.add("error");
        } else {
            field.classList.remove("error");
        }
    });

    if (!allFilled) {
        alert("Please fill in all required fields marked with a red asterisk (*)");
    } else {
        alert("Thank you! Your emergency report has been submitted.");
    }
});
