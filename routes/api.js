var express = require("express");
var router = express.Router();
import Resize from "../helpers/Resize";
const path = require("path");
import fs from "fs";
import multer from "multer";

// config for upload
var uploadImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads/news/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadImage = multer({ storage: uploadImageStorage });
router.post("/imageUpload", uploadImage.single("file"), async (req, res) => {
  let filename;
  if (req.file) {
    const imagePath = "public/uploads/news/";
    const fileUpload = new Resize(imagePath, {
      width: 1920,
      height: 1080
    });
    filename = "/uploads/news/" + (await fileUpload.save(req.file.path));
    await fs.unlinkSync(req.file.path);
  }
  res.send(filename);
});

module.exports = router;
