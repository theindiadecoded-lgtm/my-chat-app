function join() {
  const name = document.getElementById("name").value;
  const code = document.getElementById("code").value;

  if (!name || code !== "1234") {
    alert("Invalid details");
    return;
  }

  localStorage.setItem("name", name);
  window.location.href = "chat.html";
}

if (window.location.pathname.includes("chat.html")) {

  const socket = io();
  const name = localStorage.getItem("name");
  const messagesDiv = document.getElementById("messages");
  const notifySound = document.getElementById("notifySound");

  socket.emit("joinRoom", { name });

  socket.on("userCount", count => {
    document.getElementById("userCount").innerText = `${count} Online`;
  });

  socket.on("systemMessage", data => {
    const div = document.createElement("div");
    div.classList.add("system-message");
    div.innerHTML = `${data.text} <div class="time">${data.time}</div>`;
    messagesDiv.appendChild(div);
  });

  socket.on("message", data => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(data.sender === name ? "my-message" : "other-message");

    div.innerHTML = `
      ${data.sender}: ${data.text}
      <div class="time">${data.time}</div>
    `;

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (data.sender !== name) notifySound.play();
  });

  socket.on("imageMessage", data => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(data.sender === name ? "my-message" : "other-message");

    div.innerHTML = `
      ${data.sender}:<br>
      <img src="${data.image}" width="150"><br>
      <div class="time">${data.time}</div>
    `;

    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });

  window.sendMessage = function () {
    const input = document.getElementById("msg");
    const message = input.value.trim();
    if (!message) return;

    socket.emit("chatMessage", { sender: name, text: message });
    input.value = "";
  };

  document.getElementById("msg").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  document.getElementById("imageInput").addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      socket.emit("imageMessage", {
        sender: name,
        image: e.target.result
      });
    };
    reader.readAsDataURL(file);
  });

  window.toggleTheme = function () {
    document.body.classList.toggle("light-mode");
  };
}
