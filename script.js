let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let editIndex = -1;

// Calculate attendance percentage
function getAttendance(sub) {
    return (sub.attended / sub.total) * 100;
}

// Find the maximum classes that can be skipped
function getClassesToSkip(sub) {
    let skip = 0;

    while (
        sub.attended / (sub.total + skip + 1) >= 0.75
    ) {
        skip++;
    }

    return skip;
}

// Find the minimum consecutive classes needed to reach 75%
function getClassesToAttend(sub) {
    let attend = 0;

    while (
        (sub.attended + attend) / (sub.total + attend) < 0.75
    ) {
        attend++;
    }

    return attend;
}

// Determine attendance status
function getStatus(attendance) {
    if (attendance > 75) {
        return "SafeZone 🟢";
    } else if (Math.abs(attendance - 75) < 0.0001) {
        return "At Risk 🟡";
    } else {
        return "DangerZone 🔴";
    }
}

// Display all subjects
function displaySubjects() {
    let list = document.getElementById("subjectlist");
    list.innerHTML = "";

    if (subjects.length === 0) {
        list.textContent = "No subjects added yet.";
        return;
    }

    subjects.forEach(function(sub) {
        let attendance = getAttendance(sub);
        let status = getStatus(attendance);
        let statusClass = "";

if (attendance > 75) {
    statusClass = "safe";
} else if (Math.abs(attendance - 75) < 0.0001) {
    statusClass = "risk";
} else {
    statusClass = "danger";
}
        let p = document.createElement("p");

        let message = sub.name + " - " + sub.type +
            " | Total: " + sub.total +
            " | Attended: " + sub.attended +
            " | Attendance: " + attendance.toFixed(2) +
            "% | " + status;

        if (attendance > 75) {
            message += " | Classes you can skip: " +
                getClassesToSkip(sub);
        } else if (Math.abs(attendance - 75) < 0.0001) {
            message += " | Cannot skip any class";
        } else {
            message += " | Classes to attend consecutively: " +
                getClassesToAttend(sub);
        }
        p.innerHTML = message.replace(
    status,
    '<span class="' + statusClass + '">' + status + '</span>'
);

        let editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function() {
    editIndex = subjects.indexOf(sub);

    document.getElementById("subname").value = sub.name;
    document.getElementById("subjecttype").value = sub.type;
    document.getElementById("totalclass").value = sub.total;
    document.getElementById("attendclass").value = sub.attended;

    document.getElementById("addsubject").textContent = "Update Subject";
};

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        deleteBtn.onclick = function() {
        subjects = subjects.filter(function(item) {
        return item !== sub;
        });
           
        localStorage.setItem("subjects", JSON.stringify(subjects));
        displaySubjects();
};
        p.appendChild(editBtn);
        p.appendChild(deleteBtn);
        list.appendChild(p);

    });

}

// Add Subject button
document.getElementById("addsubject").onclick = function() {
    let totalValue = document.getElementById("totalclass").value;
    let attendedValue = document.getElementById("attendclass").value;
    let subname = document.getElementById("subname").value.trim();
    let subjecttype = document.getElementById("subjecttype").value;

    let totalclass = Number(totalValue);
    let classattend = Number(attendedValue);

    if (subname === "") {
        alert("Please enter the subject name.");
        return;
    }

    if (
        totalValue === "" ||
        attendedValue === "" ||
        !Number.isInteger(totalclass) ||
        !Number.isInteger(classattend) ||
        totalclass <= 0 ||
        classattend < 0 ||
        classattend > totalclass
    ) {
        alert("Enter valid class counts. Attended classes must be between 0 and total classes.");
        return;
    }

    let subject = {
        name: subname,
        type: subjecttype,
        total: totalclass,
        attended: classattend
    };

    if (editIndex === -1) {
    subjects.push(subject);
} else {
    subjects[editIndex] = subject;
    editIndex = -1;
    document.getElementById("addsubject").textContent = "Add Subject";
}
    localStorage.setItem("subjects", JSON.stringify(subjects));

    displaySubjects();

    // Clear input fields after adding
    document.getElementById("subname").value = "";
    document.getElementById("totalclass").value = "";
    document.getElementById("attendclass").value = "";
};

// Calculate button: show each subject and overall attendance
document.getElementById("calculate").onclick = function() {
    if (subjects.length === 0) {
        document.getElementById("result").textContent =
            "Please add at least one subject first.";
        return;
    }

    displaySubjects();

    let totalClasses = 0;
    let totalAttended = 0;

    subjects.forEach(function(sub) {
        totalClasses += sub.total;
        totalAttended += sub.attended;
    });

    let overallAttendance = (totalAttended / totalClasses) * 100;

    document.getElementById("result").textContent =
        "Overall Attendance: " + overallAttendance.toFixed(2) +
        "% - " + getStatus(overallAttendance);
};

// Predict attendance if future classes are attended
document.getElementById("predictattend").onclick = function() {
    let input = document.getElementById("attendfuture").value;
    let future = Number(input);
    let output = document.getElementById("attendresult");

    if (
        subjects.length === 0 ||
        input === "" ||
        !Number.isInteger(future) ||
        future < 0
    ) {
        output.textContent =
            "Add subjects and enter a valid number of future classes.";
        return;
    }

    let totalClasses = 0;
    let totalAttended = 0;

    subjects.forEach(function(sub) {
        totalClasses += sub.total;
        totalAttended += sub.attended;
    });

    let predicted =
        ((totalAttended + future) / (totalClasses + future)) * 100;

    output.textContent =
        "Overall attendance after attending " + future +
        " classes: " + predicted.toFixed(2) + "%";
};

// Predict attendance if future classes are missed
document.getElementById("predmiss").onclick = function() {
    let input = document.getElementById("skipfuture").value;
    let future = Number(input);
    let output = document.getElementById("missresult");

    if (
        subjects.length === 0 ||
        input === "" ||
        !Number.isInteger(future) ||
        future < 0
    ) {
        output.textContent =
            "Add subjects and enter a valid number of classes to skip.";
        return;
    }

    let totalClasses = 0;
    let totalAttended = 0;

    subjects.forEach(function(sub) {
        totalClasses += sub.total;
        totalAttended += sub.attended;
    });

    let predicted =
        (totalAttended / (totalClasses + future)) * 100;

    output.textContent =
        "Overall attendance after missing " + future +
        " classes: " + predicted.toFixed(2) + "%";
};
displaySubjects();
