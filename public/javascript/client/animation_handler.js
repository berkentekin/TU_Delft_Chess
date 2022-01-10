function addAnimationAfterEffect(el, effect)
{
    const addF = () =>
    {
        effect(el);
        el.removeEventListener(addF);
    }
    el.addEventListener(addF);
}