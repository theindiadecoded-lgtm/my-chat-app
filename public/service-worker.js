self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("chat-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/chat.html",
        "/style.css",
        "/script.js"
      ]);
    })
  );
});
