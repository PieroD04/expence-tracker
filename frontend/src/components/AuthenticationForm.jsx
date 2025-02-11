import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextField, Button, CircularProgress, Typography, Box } from "@mui/material";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import SnackbarAlert from "../components/SnackbarAlert";

function AuthenticationForm({ route, method }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const createAlert = (message, severity) => {
        setAlertMessage(message);
        setSeverity(severity);
        setOpenSnackbar(true);
    };

    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post(route, data);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

                await getSettings();

                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            createAlert(error.message || "Something went wrong!", "error");
        } finally {
            setLoading(false);
        }
    };

    const getSettings = () => {
        api.get("/api/settings/")
            .then((res) => res.data)
            .then((data) => {
                localStorage.setItem("preferred_currency", data[0].preferred_currency || 'USD');
            })
            .catch((err) => {
                createAlert(err.message || "Something went wrong!", "error");
            })
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxWidth: 400,
                        width: '100%',
                        p: 3,
                        backgroundColor: 'background.paper'
                    }}
                >
                    <Typography variant="h5" align="center">{name}</Typography>
                    <TextField
                        label="Username"
                        {...register("username", { required: "Username is required" })}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        {...register("password", { required: "Password is required" })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : name}
                    </Button>
                    <Typography align="center">
                        {method === "login" ? "Don't have an account?" : "Already have an account?"}
                        <Button color="primary" onClick={() => navigate(method === "login" ? "/register" : "/login")}>
                            {method === "login" ? "Register" : "Login"}
                        </Button>
                    </Typography>
                </Box>
            </Box>
            <SnackbarAlert
                open={openSnackbar}
                severity={severity}
                message={alertMessage}
                onClose={() => setOpenSnackbar(false)}
            />
        </>

    );
}

export default AuthenticationForm;