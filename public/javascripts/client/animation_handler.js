let startupAnimationEnabled = localStorage.getItem("enableStartupAnimation");
let enableMoveAnimation = localStorage.getItem("enableMoveAnimation");

if (startupAnimationEnabled === null) {startupAnimationEnabled = true;}
if (enableMoveAnimation === null) {enableMoveAnimation = true;}

startupAnimationEnabled = startupAnimationEnabled === "true";
enableMoveAnimation = enableMoveAnimation === "true";

if (startupAnimationEnabled)
{
    console.log("here");
    document.body.classList.remove("no-animation"); // Add back animation
}

// Wow this became a real mess
const playCheckboxAnimation = (checkbox) =>
{
    checkbox.parentElement.querySelectorAll("animate").forEach(animation =>
    {
        animation.setAttribute("from", checkbox.checked ? "0": "1");
        animation.setAttribute("to", checkbox.checked ? "1": "0");
        animation.beginElement();
    });
}

const checkboxFunction = {"enableStartupAnimation": (checked) =>
                          {
                              localStorage.setItem("enableStartupAnimation", checked);
                          }, 
                          "enableMoveAnimation": (checked) =>
                          { 
                            enableMoveAnimation = checked;
                            localStorage.setItem("enableMoveAnimation", checked);
                          }};

const updateCheckbox = (checkbox) =>
{
    let checkmark = checkbox.parentElement.querySelector(".checkbox-svg path:nth-child(2)");
    checkmark.style.fill = `url(#svg-animation-${checkbox.getAttribute("num")})`;

    checkbox.addEventListener("change", () =>
    {
        checkboxFunction[checkbox.id](checkbox.checked);
        playCheckboxAnimation(checkbox);
    });
}

let temp = document.getElementById("enableStartupAnimation");
temp.checked = startupAnimationEnabled;
updateCheckbox(temp);
playCheckboxAnimation(temp);

temp = document.getElementById("enableMoveAnimation");
temp.checked = enableMoveAnimation;
updateCheckbox(temp);
playCheckboxAnimation(temp);

function addAnimationAfterEffect(el, effect)
{
    const addF = () =>
    {
        effect(el);
        el.removeEventListener("animationend", addF);
    }
    el.addEventListener("animationend", addF);
}

let fake; // You just got faked B-)

function animateParentChange1(element)
{
    if (!enableMoveAnimation) {return false;}

    let boundingBox = element.getBoundingClientRect();
    let top = boundingBox.top + window.pageYOffset;
    let left = boundingBox.left + window.pageXOffset;

    fake = element.cloneNode(false);
    
    fake.style.position = "absolute";
    fake.style.top = top + "px";
    fake.style.left = left + "px";
    fake.style.width = boundingBox.width + "px";
    fake.style.height = boundingBox.height + "px";
    fake.style.zIndex = 9999;
    fake.className = "";

    document.body.appendChild(fake);
    
    return true;
}

function animateParentChange2(element, finish_action)
{
    let boundingBox = element.getBoundingClientRect();
    let top = boundingBox.top + window.pageYOffset;
    let left = boundingBox.left + window.pageXOffset;

    element.style.display = "none";

    let animation = fake.animate([
        {top: top + "px", left: left + "px"}
    ], {
        duration: Math.pow((Math.pow(top - parseInt(fake.style.top), 2) + // Using euclidean distance as duration
                   Math.pow(left - parseInt(fake.style.left), 2)), 0.5)
    });

    animation.onfinish = () =>
    {
        fake.remove();
        element.style.display = "block"; 
        finish_action();  
    };
}