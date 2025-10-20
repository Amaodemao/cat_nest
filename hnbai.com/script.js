function ShowTheBar(){
    let special = document.getElementById("specialbar");
    if(special.style.display == "none"){
        special.style.display = "block";
    }
    else if(special.style.display == "block"){
        special.style.display = "none";
    }
}

function Align(){
    let h2 = document.querySelectorAll("h2");
    for(let i = 0; i < h2.length; i++){
        if(h2[i].classList.contains("text-start")){
            h2[i].classList.remove("text-start")
            h2[i].classList.add("text-center")
        }
        else if(h2[i].classList.contains("text-center")){
            h2[i].classList.remove("text-center")
            h2[i].classList.add("text-end")
        }
        else if(h2[i].classList.contains("text-end")){
            h2[i].classList.remove("text-end")
            h2[i].classList.add("text-start")
        }
    }
}

function NewCourse(){
    let courses = document.getElementById("courseTable");
    console.log(courses)
    let NewCourse = prompt("Enter a new course number:");
    if(NewCourse != ""){
        let CourseName = prompt("Enter the course name:");
        let NewRow = document.createElement("tr");
        let NewCourseNumber = document.createElement("th");
        NewCourseNumber.innerHTML = NewCourse;
        let NewCourseName = document.createElement("th");
        if(CourseName != ""){
            NewCourseName.innerHTML = CourseName;
        }
        else{
            NewCourseName.innerHTML = "N/A";
        }
        NewRow.appendChild(NewCourseNumber);
        NewRow.appendChild(NewCourseName);
        courses.appendChild(NewRow);
    }
}

// When this button is clicked, a Bootstrap progress bar is shown or hidden below the button bar.
// when the user scrolls the page, the progress bar adjusts according to the scroll position, i.e., 0% at the top and 100% at the bottom.
// I may use these: window.scrollY, document.body.clientHeight, window.innerHeight

window.onscroll = function(){
    let progress = document.getElementById("scrollBar");
    let max = document.body.scrollHeight - window.innerHeight;
    let value = (window.scrollY / max) * 100;
    progress.style.width = value + "%";
    progress.setAttribute("aria-valuenow", value);
}

function ShowTheProgressBar(){
    let bar = document.getElementById("scrollBarContainer");
    if(bar.style.display == "none"){
        bar.style.display = "block";
    }
    else if(bar.style.display == "block"){
        bar.style.display = "none";
    }
}

function processform() {
    let validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let email = document.querySelector("#new-email").value;
    let comment = document.querySelector("#new-comment").value;
    if(email == "" || comment == ""){
        alert("Please fill out all fields.");
        return
    }
    if(!email.match(validEmailRegex)){
        alert("Please enter a valid email address.");
        return
    }

    let newComment = document.createElement("div");
    let element = '<div><svg height="100" width="100"><circle cx="50" cy="50" r="40"></svg></div><div><h5></h5><p></p></div>';
    newComment.innerHTML = element;

    newComment.className = "d-flex";
    newComment.querySelectorAll("div")[0].className= "flex-shrink-0"; // 1st div
    newComment.querySelectorAll("div")[1].className= "flex-grow-1"; // 2nd div

    let lastComment = document.querySelector("#comments").lastElementChild; // instead of lastChild for div element
    // newComment.id = 'c' + (Number(lastComment.id.substr(1)) + 1);

    newComment.querySelector("h5").innerHTML = document.querySelector("#new-email").value;
    newComment.querySelector("p").innerHTML = document.querySelector("#new-comment").value;

    let color = document.querySelectorAll("input[name=new-color]:checked")[0].value; 

    newComment.querySelector("circle").setAttribute("fill", color);

    document.querySelector("#comments").appendChild(newComment);
    document.querySelector("form").reset();
    autoSave();
}

function loadfile(){
    fetch('file.txt')
    .then(response => response.text())
    .then(data => document.querySelector("#comments").innerHTML = data)
}

// Save comments into file.txt using JS Fetch, with Web Server for Chrome.
function savefile(){
    let comments = document.querySelector("#comments");
    fetch('file.txt', {
        method: 'PUT',
        body: comments.innerHTML
    })
}

function autoLoad(){
    loadfile();
}

function autoSave(){
    savefile();
}