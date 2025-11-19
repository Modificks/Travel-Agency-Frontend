import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {LanguageProvider} from "./context/LanguageContext";
import {AuthProvider} from "./context/AuthContext";
import AppWrapper from "./AppWrapper";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <LanguageProvider>
            <AuthProvider>
                <AppWrapper />
            </AuthProvider>
        </LanguageProvider>
    </React.StrictMode>
);

