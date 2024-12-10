import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

export async function generateMsg({ messages }) {
    try {

        const result = await axios({
            method: "POST",
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
            data: {
                contents: [
                    {
                        parts: [
                            {
                                text: `${messages}`
                            }
                        ]
                    }
                ]
            },
        });

        return result.data; 
    } catch (error) {
        console.error("Error generating message:", error.response?.data || error.message);
        throw new Error("Failed to generate message.");
    }
}
