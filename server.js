const path = require('path');
const express = require('express');

const app = new express();
const port = 3000;

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "pages", 'login.html'));
});

app.get('/register', (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "register.html"));
})

app.get("/set_user_info", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "userInfoSet.html"));
})

app.get("/userInfo", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "userInfo.html"));
})

app.get("/waitRoom", (req, res) => {

  res.sendFile(path.join(__dirname, "pages", "waitRoom.html"))
})

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
}
});
