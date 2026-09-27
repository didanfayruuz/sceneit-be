import { Router } from "express";
import { register, login, logout, me, updateProfile } from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const authRouter = Router();
authRouter.patch("/me", requireAuth, updateProfile); 
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);