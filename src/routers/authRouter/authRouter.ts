import { Router } from "express";

import {
    userEmailValidator,
    userLoginValidator,
    userPasswordValidator
} from "../validators";
import {
    confirmationCodeValidator,
    loginOrEmailValidator,
    newPasswordValidator,
    passwordRecoveryCodeValidator,
    passwordValidator
} from "./validators";
import { AuthController } from "./authController";
import { compositionRootContainer } from "../../composition-root";
import { jwtAuthMiddleware } from "../../middlewares/jwtAuthMiddleware";
import { rateLimitMiddleware } from "../../middlewares/rateLimitMiddleware";
import { errorResultMiddleware } from "../../middlewares/errorResultMiddleware";

export const authRouter = Router();
const authController = compositionRootContainer.get(AuthController)

authRouter
    .route("/login")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        loginOrEmailValidator,
        passwordValidator,
        errorResultMiddleware,
        authController.loginUser.bind(authController));

authRouter
    .route("/refresh-token")
    .post(
        authController.refreshToken.bind(authController));

authRouter
    .route("/logout")
    .post(
        authController.logoutUser.bind(authController));

authRouter
    .route("/me")
    .get(
        jwtAuthMiddleware,
        authController.getUserInfo.bind(authController));

authRouter
    .route("/registration")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        userLoginValidator,
        userPasswordValidator,
        userEmailValidator,
        errorResultMiddleware,
        authController.registerUser.bind(authController));

authRouter
    .route("/registration-confirmation")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        confirmationCodeValidator,
        errorResultMiddleware,
        authController.confirmRegistration.bind(authController));

authRouter
    .route("/registration-email-resending")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        userEmailValidator,
        errorResultMiddleware,
        authController.resendRegistrationEmail.bind(authController));

authRouter
    .route("/password-recovery")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        userEmailValidator,
        errorResultMiddleware,
        authController.recoverPassword.bind(authController));

authRouter
    .route("/new-password")
    .post(
        rateLimitMiddleware({maxAttempts: 5, periodInSec: 10}),
        newPasswordValidator,
        passwordRecoveryCodeValidator,
        errorResultMiddleware,
        authController.confirmPasswordRecovery.bind(authController));