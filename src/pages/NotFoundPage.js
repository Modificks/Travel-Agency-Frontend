import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./styles/NotFoundPage.css";

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="not-found-body">
            <div className="not-found-container">
                <h1 className="not-found-title">{t("notFound.title")}</h1>
                <p className="not-found-text">
                    {t("notFound.text")}
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/")}
                >
                    {t("notFound.backHome")}
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
