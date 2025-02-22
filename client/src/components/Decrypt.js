import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Decrypt = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // ✅ Use Network IP Instead of localhost
    const SERVER_URL = "http://192.168.238.70:5000"; // Replace X.X with your local IP

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleDecrypt = async () => {
        if (!selectedFile || !password) {
            alert("Please upload an encrypted image and enter a password!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("password", password);

            const response = await axios.post(`${SERVER_URL}/api/decrypt`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Decryption Response:", response.data);
            if (response.data.message) {
                setMessage(response.data.message);
            } else {
                setMessage("❌ Decryption failed. Incorrect password or corrupted file.");
            }
        } catch (error) {
            console.error("❌ Decryption Failed:", error);
            setMessage("❌ Decryption failed. Check password or file.");
        }
    };

    return (
        <div className="container flex justify-center items-center min-h-screen bg-gray-100">
            <div className="card w-[450px] p-6 bg-white border border-gray-300 shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4 text-center leading-relaxed tracking-widest font-sans">
                    StegoMedia
                </h1>
                <h2 className="text-2xl font-semibold mb-4 text-center">Decrypt Image</h2>
                <div className="flex justify-center gap-6 p-4">
                    <button className="btn-light px-6 py-3 font-semibold rounded" onClick={() => navigate("/Encrypt")}>
                        Encode
                    </button>
                    <button className="btn-dark px-6 py-3 font-semibold rounded" onClick={() => navigate("/Decrypt")}>
                        Decode
                    </button>
                    <hr></hr>
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload Encrypted Image</h3>
                <input type="file" className="w-full border p-2 rounded mb-3 text-sm" onChange={handleFileChange} />

                <h3 className="text-lg font-semibold mb-2">Enter Password</h3>
                <input type="password" className="w-full border p-2 rounded mb-3 text-sm" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <div>
                    <button className="button w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition duration-300" onClick={handleDecrypt}>
                        Decrypt
                    </button>

                    {message && <p className="mt-4 text-center text-green-600 font-semibold">Decrypted Message: {message}</p>}
                </div>
            </div>

        </div>
    );
};

export default Decrypt;
