import React, { useState } from "react";
import { Link } from "react-router-dom";

function SettingsMenu() {
    const [settings, setSettings] = useState({
        sound: true,
        music: true,
        story: true,
        mClips: true,
        tween: true,
        repetitions: true,
        calibration: true,
        hints: true,
        noOfHints: 3,
        language: "English",
        audioRecording: false,
        videoRecording: false,
        fps: 30,
        researchMode: false,
        teachingMode: false,
        closedCaptions: false,
        visualAssist: false,
        textToSpeech: false,
        pictureInPicture: false,
    });

    const handleToggle = (settingKey) => {
        setSettings({
            ...settings,
            [settingKey]: !settings[settingKey],
        });
    };

    const handleChange = (settingKey, value) => {
        setSettings({
            ...settings,
            [settingKey]: value,
        });
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
            <h2>Settings Menu</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {Object.keys(settings).map((key) => (
                    <li key={key} style={{ marginBottom: "1rem" }}>
                        {typeof settings[key] === "boolean" ? (
                            <div>
                                <label>{key.replace(/([A-Z])/g, " $1")}:</label>
                                <button
                                    onClick={() => handleToggle(key)}
                                    style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
                                >
                                    {settings[key] ? "On" : "Off"}
                                </button>
                            </div>
                        ) : key === "noOfHints" || key === "fps" ? (
                            <div>
                                <label>{key.replace(/([A-Z])/g, " $1")}:</label>
                                <input
                                    type="number"
                                    value={settings[key]}
                                    onChange={(e) => handleChange(key, parseInt(e.target.value, 10))}
                                    style={{ marginLeft: "1rem", padding: "0.5rem" }}
                                />
                            </div>
                        ) : key === "language" ? (
                            <div>
                                <label>{key.replace(/([A-Z])/g, " $1")}:</label>
                                <select
                                    value={settings[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    style={{ marginLeft: "1rem", padding: "0.5rem" }}
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    {/* Add more languages as needed */}
                                </select>
                            </div>
                        ) : null}
                    </li>
                ))}
            </ul>

            <p style={{ marginTop: "2rem" }}>
                <Link to="/">Back to Home</Link>
            </p>
        </div>
    );
}

export default SettingsMenu;