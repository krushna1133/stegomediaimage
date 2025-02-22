
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



const decryptText = (encryptedText, password) => {
    try {
        const decipher = crypto.createDecipher("aes-256-cbc", password);
        let decrypted = decipher.update(encryptedText, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
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

        const image = await Jimp.read(imageBuffer);
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

                        //new add for check error at 01:40 AM
                        if (!decryptedMessage) {
                              return res.status(400).json({ error: "Invalid password or corrupted image." });
                        }

                        
                        if (decryptedMessage === null) {
                            console.error("❌ Incorrect Password! Decryption failed.");
                            return res.status(400).json({ error: "Incorrect password. Unable to decrypt message." });
                        }

                        //added for check file send after encryption is correct or not
                        console.log("🔍 Received Image:", req.file);
                        console.log("🔍 Received Password:", req.body.password);


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
