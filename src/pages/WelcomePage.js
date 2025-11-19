import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/WelcomePage.css";
import {useLanguage} from "../context/LanguageContext";

function WelcomePage() {
    const navigate = useNavigate();
    const { language, toggleLanguage, t } = useLanguage();

    return (
        <div className="welcome-body">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="welcome-container">
                <h1 className="welcome-title">
                    {t("welcome.title")}
                </h1>

                <div className="welcome-buttons">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/login")}
                    >
                        {t("welcome.login")}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/register")}
                    >
                        {t("welcome.register")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WelcomePage;
