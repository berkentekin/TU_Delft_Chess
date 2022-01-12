let animationsEnabled = false;
let movePieceAnimationEnabled = true;

if (animationsEnabled)
{
    document.body.classList.remove("no-animation"); // Add back animation
}

const checkbox = {};

document.querySelectorAll(".hidden-checkbox").forEach(checkbox =>
{
    let checkmark = checkbox.parentElement.querySelector(".checkbox-svg path:nth-child(2)");
    checkmark.style.fill = `url(#svg-animation-${checkbox.getAttribute("num")})`;

    checkbox.addEventListener("change", () =>
    {

        checkbox.parentElement.querySelectorAll("animate").forEach(animation =>
        {
            animation.setAttribute("from", checkbox.checked ? "1": "0");
            animation.setAttribute("to", checkbox.checked ? "0": "1");
            animation.beginElement();
        });
    });
});

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
    if (!movePieceAnimationEnabled) {return false;}

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