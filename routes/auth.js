import express from "express";
const router = express.Router();
import Validator from "validatorjs";
import { connect } from "net";
import connection from "../config/database";
import bcrypt from "bcrypt";

export const SALT_ROUND = 10;

router.get("/add-sample-data", (req, res, next) => {
  const data = [
    "บัณฑิต นันทะเทศ",
    "admin",
    bcrypt.hashSync("1234", SALT_ROUND),
    "silkyland@gmail.com",
    "1",
    "/img/150x150.png"
  ];
  const SQL =
    "INSERT INTO users (name, username, password, email, role_id, avatar) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(SQL, [...data], (err, user) => {
    if (err) return res.send(err.message);
    res.send("Save Success");
  });
});

router.get("/login", (req, res, next) => {
  if (req.session.auth) {
    return res.redirect("/");
  }
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const rules = {
    username: "required|min:3",
    password: "required|min:3"
  };
  const validation = new Validator(req.body, rules);
  if (validation.fails()) {
    req.flash("errors", validation.errors.all());
    return res.redirect("/auth/login");
  }
  const query = "SELECT * FROM users WHERE username = ?";
  connection.query(query, [username], async (error, result) => {
    if (error) return res.send(error.message);
    if (
      result.length < 1 ||
      !bcrypt.compareSync(password, result[0].password)
    ) {
      req.flash("errors", [
        { message: "ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง" }
      ]);
      return res.redirect("/auth/login");
    }
    const user = await JSON.parse(JSON.stringify(result[0]));
    const session = req.session;
    session.auth = {
      isLogin: true,
      user: {
        id: user.id,
        avatar: user.avatar,
        name: user.name,
        email: user.email,
        role: user.role_id,
        username: user.username
      },
      check: () => true
    };
    res.redirect("/admin");
  });
});

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
