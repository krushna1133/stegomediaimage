import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Colors.css";
import "../styles.css";

const Encrypt = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [encryptedImage, setEncryptedImage] = useState(null);
  const navigate = useNavigate();

  // ✅ Use Network IP (Change this to your actual IP)
  const SERVER_URL = "http://192.168.238.70:5000"; // Replace X.X with your local IP

  const handleEncrypt = async () => {
    if (!image || !message || !password) {
      alert("Please fill all fields and select an image.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("message", message);
    formData.append("password", password);

    try {
      const response = await axios.post(`${SERVER_URL}/api/encrypt`, formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      setEncryptedImage(url);
    } catch (error) {
      console.error("❌ Encryption failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (encryptedImage) {
      const link = document.createElement("a");
      link.href = encryptedImage;
      link.download = "encrypted_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container">
      <div className="card w-[450px] border border-gray-300 bg-white p-10 rounded-lg shadow-md">
        {/* <h2 className="text-lg font-seibold mb-4 text-center ">StegoMedia</h2> */}
        <h1 className="text-2xl font-bold mb-4 text-center leading-relaxed tracking-widest font-sans">
          StegoMedia
        </h1>


        <h2 className=" font-semibold">Encrypt Image</h2>

        <div className="flex justify-center gap-6 p-4">
          <button className="btn-dark px-6 py-3 font-semibold rounded" onClick={() => navigate("/Encrypt")}>
            Encode
          </button>
          <button className="btn-light px-6 py-3 font-semibold rounded" onClick={() => navigate("/Decrypt")}>
            Decode
          </button>
          <hr></hr>
        </div>


        <div className="p-4">
          <input type="file" className="w-full border p-2 rounded text-sm" onChange={(e) => setImage(e.target.files[0])} />

          {/* <label className="block mt-2">Message:</label>
          <input type="text" className="w-full border p-2 rounded text-sm" placeholder="Enter Message" onChange={(e) => setMessage(e.target.value)} /> */}
          <div>
            <h3 className="font-bold mb-2">Message:</h3>
            <textarea
              className="w-full border p-3 rounded-md text-base h-32 resize-none"
              placeholder="Enter Message"
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>


            {/* <label className="block mt-2">Message: </label> */}
            {/* <input type="text" className="w-full border p-2 rounded text-sm" placeholder="Enter Message" onChange={(e) => setMessage(e.target.value)} /> */}

          </div>
          <div >
            <h3>Password:</h3>
            {/* <label className="block mt-2"></label> */}
            <input type="password" className="w-full border p-4 rounded text-sm" placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />

          </div>
          <button onClick={handleEncrypt} className="button mt-4 w-full" disabled={loading}>
            {loading ? "Encrypting..." : "Encrypt data"}
          </button>

          {encryptedImage && (
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold mb-2">Encrypted Image</h3>
              <div className="border rounded-lg inline-block">
                <img src={encryptedImage} alt="Encrypted" className="encrypted-image" />
              </div>
              <button onClick={handleDownload} className="button mt-3 px-4 py-2 bg-blue-500 text-white rounded">
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Encrypt;
