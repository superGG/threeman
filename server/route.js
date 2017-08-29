/**
 * Created by Ninico on 29/08/2017.
 */

const fs = require('fs');
const path = require('path');


// /main /register /userInfoSet /userInfo /waitRoom
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", 'login.html'));
// });
//
// app.get('/main', (req, res) => {
//   res.sendFile(path.join(__dirname, "pages", "main.html"))
// });
//
// app.get('/register', (req, res) => {
//
//   res.sendFile(path.join(__dirname, "pages", "register.html"));
// })
//
// app.get("/userInfoSet", (req, res) => {
//
//   res.sendFile(path.join(__dirname, "pages", "userInfoSet.html"));
// })
//
// app.get("/userInfo", (req, res) => {
//
//   res.sendFile(path.join(__dirname, "pages", "userInfo.html"));
// })
//
// app.get("/waitRoom", (req, res) => {
//
//   res.sendFile(path.join(__dirname, "pages", "waitRoom.html"))
// })
//
// app.get("/socket", (req, res) => {
//
//   res.sendFile(path.join(__dirname, "socketTest.html"))
// });
//
// app.get("/admin", (req, res) => {
//
//   res.sendFile(path.join(__dirname, "admin", "index.html"))
// });

const config = {
  '/': ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/login.html'));
  }
};

const login = ctx => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/login.html'));
};

const getConfig = pageName => {

  if(config[pageName]) {

    return config[pageName]
  }

  return ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(path.join(__dirname, '../pages/' + pageName + '.html'));
  }
};

exports.getConfig = getConfig;

