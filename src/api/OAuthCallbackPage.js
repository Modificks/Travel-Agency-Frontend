import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallbackPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/vouchers");
    }, [navigate]);

    return <p>Authorizing...</p>;
};

export default OAuthCallbackPage;
