import React, { type SubmitEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/login_background.png";
// import Keycloak, { type KeycloakLoginOptions } from "keycloak-js";

const LoginPage = () => {
    const navigate = useNavigate();

    const doLogin: SubmitEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        alert("Logging in!");
    };

    const cancelLogin = () => {
        navigate("/");
    };

    return (
        <>
        <div
            className="hero min-h-screen bg-base-300 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${loginImage})` }}
        >
            {/* Optional: Dark overlay to make the form pop */}
            <div className="hero-overlay bg-opacity-60"></div>

            <div className="hero-content text-center">
                <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
                        <form className="card-body" onSubmit={doLogin}>
                        <h1 className="mb-4 text-3xl font-bold">LOGIN</h1>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <input type="text" placeholder="Username" className="input input-bordered" required />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input type="password" placeholder="password" className="input input-bordered" required />
                            <label className="label">
                                <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                            </label>
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-primary" type="submit">LOGIN</button>
                            <button className="btn btn-outline ml-10" onClick={cancelLogin} type="button">CANCEL</button>
                        </div>
                    </form>
                </div>
            </div>
            <div>Keycloak: {import.meta.env.VITE_KEYCLOAK_URL}</div>

        </div>

        </>
    );

//    <Link to="/">Back to Home</Link>

}

export default LoginPage;