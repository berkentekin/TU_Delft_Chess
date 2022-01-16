const chatbox = document.getElementById("chat-textbox");
const chatForm = document.getElementById("chat-form");

// Note, this function is not sanitized, which is a terrible idea but I'm lazy
function addEntry(entry)
{
   let text = document.createElement("p");
    text.innerHTML = entry;
    chatbox.appendChild(text);
    chatbox.scrollTop = chatbox.scrollHeight;
}

chatForm.addEventListener("submit", (event) =>
{
    send_message(TCHAT, chatInput.value, ws);
    chatInput.value = "";
    event.preventDefault();
});