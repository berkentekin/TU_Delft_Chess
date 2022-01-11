let animationsEnabled = false;
let captureAnimationEnabled = true;

if (animationsEnabled)
{
    document.body.classList.remove("no-animation"); // Add back animation
}

function addAnimationAfterEffect(el, effect)
{
    const addF = () =>
    {
        effect(el);
        el.removeEventListener("animationend", addF);
    }
    el.addEventListener("animationend", addF);
}


let fake;

function animateParentChange1(element)
{
  //  if (!animationsEnabled) {return;}

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
}

function animateParentChange2(element, finish_action)
{
    if (!captureAnimationEnabled) {return false;}

    let boundingBox = element.getBoundingClientRect();
    let top = boundingBox.top + window.pageYOffset;
    let left = boundingBox.left + window.pageXOffset;

    element.style.display = "none";

    let animation = fake.animate([
        {top: top + "px", left: left + "px"}
    ], {
        duration: Math.pow((Math.pow(top - parseInt(fake.style.top), 2) + 
                   Math.pow(left - parseInt(fake.style.left), 2)), 0.5)
    });

    animation.onfinish = () =>
    {
        fake.remove();
        element.style.display = "block"; 
        finish_action();  
    };

    return true;
}