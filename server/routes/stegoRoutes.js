const express = require("express");
const router = express.Router();
const { encryptImage, decryptImage } = require("../controllers/stegoController");
const upload = require("../middlewares/uploadMiddleware");

router.post("/encrypt", upload.single("image"), encryptImage);
router.post("/decrypt", upload.single("image"), decryptImage); // ✅ Ensure this exists

module.exports = router;


// const express = require("express");
// const multer = require("multer");
// const { encryptImage, decryptImage } = require("../controllers/stegoController");

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// // ✅ Ensure "file" is the field name expected by Multer
// router.post("/encrypt", upload.single("file"), encryptImage);
// router.post("/decrypt", upload.single("file"), decryptImage);

// module.exports = router;
