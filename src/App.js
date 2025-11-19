import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OAuthCallbackPage from "./api/OAuthCallbackPage";
import HomePage from "./pages/HomePage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import ProfilePage from "./pages/user/ProfilePage";
import WelcomePage from "./pages/WelcomePage";
import NotFoundPage from "./pages/NotFoundPage";
import VoucherDetailsPage from "./pages/voucher/VoucherDetailsPage";
import MyTripsPage from "./pages/user/MyTripsPage";
import AdminPanelPage from "./pages/admin/AdminPage";
import CreateVoucherPage from "./pages/voucher/CreateVoucherPage";
import EditVoucherPage from "./pages/voucher/EditVoucherPage";
import UsersManagementPage from "./pages/user/UsersManagementPage";
import AdminUserVouchersPage from "./pages/admin/AdminUserVouchersPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/oauth-callback" element={<OAuthCallbackPage/>}/>
                <Route path="/vouchers" element={<HomePage/>}/>
                <Route path="/vouchers/:id" element={<VoucherDetailsPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage/>}/>
                <Route path="/me" element={<ProfilePage/>}/>
                <Route path="/my-trips" element={<MyTripsPage/>}/>

                <Route path="/admin" element={<AdminPanelPage/>}/>
                <Route path="/admin/create-voucher" element={<CreateVoucherPage/>}/>
                <Route path="/admin/vouchers/edit/:voucherId" element={<EditVoucherPage/>}/>
                <Route path="/admin/users" element={<UsersManagementPage/>}/>
                <Route path="/admin/users/:userId/vouchers" element={<AdminUserVouchersPage />} />

                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
