
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto"); // ✅ For encryption

const encryptText = (text, password) => {
    const key = crypto.scryptSync(password, "salt", 32); // Generate a 32-byte key
    const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted; // Store IV with encrypted text
};

const encryptImage = async (req, res) => {
    try {
        if (!req.file || !req.body.message || !req.body.password) {
            return res.status(400).json({ error: "Image, message, and password required." });
        }

        const imageBuffer = req.file.buffer;
        let message = req.body.message;
        const password = req.body.password;

        // ✅ Encrypt the message using the password
        const encryptedMessage = encryptText(message, password) + "###END###";

        // Convert encrypted message to binary
        const binaryMessage = Buffer.from(encryptedMessage, "utf-8")
            .toString("binary")
            .split("")
            .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
            .join("");

        const image = await Jimp.read(imageBuffer);
        let index = 0;

        for (let y = 0; y < image.bitmap.height && index < binaryMessage.length; y++) {
            for (let x = 0; x < image.bitmap.width && index < binaryMessage.length; x++) {
                let pixel = image.getPixelColor(x, y);
                let red = (pixel >> 24) & 0xff;
                let green = (pixel >> 16) & 0xff;
                let blue = (pixel >> 8) & 0xff;

                // Modify only the least significant bit (LSB) of blue
                blue = (blue & 0b11111110) | parseInt(binaryMessage[index], 10);
                index++;

                image.setPixelColor(Jimp.rgbaToInt(red, green, blue, 255), x, y);
            }
        }

        const outputPath = path.join(__dirname, "../uploads/encrypted.png");
        await image.writeAsync(outputPath);

        console.log("✅ Image encrypted and saved!");
        res.download(outputPath);
    } catch (error) {
        console.error("❌ Encryption Error:", error);
        res.status(500).json({ error: "Encryption failed", details: error.message });
    }
};

//this change
const decryptText = (encryptedText, password) => {
    try {
        const [ivHex, encryptedData] = encryptedText.split(":"); // Extract IV and encrypted text
        const iv = Buffer.from(ivHex, "hex");
        const key = crypto.scryptSync(password, "salt", 32);

        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        return null; // Return null if the password is incorrect
    }
};
const decryptImage = async (req, res) => {
    try {
        if (!req.file || !req.body.password) {
            return res.status(400).json({ error: "Image and password required for decryption." });
        }

        const imageBuffer = req.file.buffer;
        const password = req.body.password;

        console.log("🔍 Received Image:", req.file);
        console.log("🔍 Received Password:", password);

        // Write buffer to temp file (some Jimp versions require this)
        const tempPath = path.join(__dirname, "../uploads/temp.png");
        fs.writeFileSync(tempPath, imageBuffer);

        const image = await Jimp.read(tempPath); // Read from file instead of buffer

        let binaryMessage = "";
        let message = "";

        for (let y = 0; y < image.bitmap.height; y++) {
            for (let x = 0; x < image.bitmap.width; x++) {
                let pixel = image.getPixelColor(x, y);
                let blue = (pixel >> 8) & 0xff;

                // Extract LSB from blue channel
                binaryMessage += (blue & 1).toString();

                // Convert binary to text every 8 bits
                if (binaryMessage.length % 8 === 0) {
                    let char = String.fromCharCode(parseInt(binaryMessage.slice(-8), 2));
                    message += char;

                    // ✅ Stop reading if we detect the end marker
                    if (message.includes("###END###")) {
                        message = message.replace("###END###", "").trim();

                        // ✅ Decrypt the message using the password
                        const decryptedMessage = decryptText(message, password);

                        if (!decryptedMessage) {
                            return res.status(400).json({ error: "Invalid password or corrupted image." });
                        }

                        console.log("✅ Decrypted Message:", decryptedMessage);
                        return res.json({ message: decryptedMessage });
                    }
                }
            }
        }

        console.error("❌ No valid message found.");
        res.status(400).json({ error: "No hidden message detected." });
    } catch (error) {
        console.error("❌ Decryption Error:", error);
        res.status(500).json({ error: "Decryption failed", details: error.message });
    }
};


module.exports = { encryptImage, decryptImage };
