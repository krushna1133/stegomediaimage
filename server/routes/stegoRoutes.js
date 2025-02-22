const express = require("express");
const router = express.Router();
const { encryptImage, decryptImage } = require("../controllers/stegoController");
const upload = require("../middlewares/uploadMiddleware");

router.post("/encrypt", upload.single("image"), encryptImage);
router.post("/decrypt", upload.single("image"), decryptImage); // ✅ Ensure this exists

module.exports = router;
