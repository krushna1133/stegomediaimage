const express = require("express");
const multer = require("multer");
const { encryptImage, decryptImage } = require("../controllers/stegoController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Ensure "image" matches frontend
router.post("/encrypt", upload.single("image"), encryptImage);
router.post("/decrypt", upload.single("image"), decryptImage);

module.exports = router;
