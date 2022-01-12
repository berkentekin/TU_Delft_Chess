let animationsEnabled = false;
let captureAnimationEnabled = true;

if (animationsEnabled)
{
    document.body.classList.remove("no-animation"); // Add back animation
}

document.querySelectorAll(".hidden-checkbox").forEach(checkbox =>
{
    checkbox.addEventListener("change", () =>
    {
        console.log("here" + checkbox);
        checkbox.parentElement.querySelectorAll("animate").forEach(animation =>
        {
            console.log("here");
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
    console.log(element);
    if (!captureAnimationEnabled) {return false;}

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