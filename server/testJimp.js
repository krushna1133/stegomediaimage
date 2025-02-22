const Jimp = require("jimp");

async function testJimp() {
  try {
    console.log("Testing Jimp with a local image...");
    const image = await Jimp.read("test.png");  // Use a real file in server/
    console.log("✅ Jimp is working correctly!");
  } catch (error) {
    console.error("❌ Jimp test failed:", error);
  }
}

testJimp();
