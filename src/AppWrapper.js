import { useAuth } from "./context/AuthContext";
import App from "./App";

const AppWrapper = () => {
    const { loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>;
    }

    return <App />;
};

export default AppWrapper;
