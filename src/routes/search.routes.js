import { Router } from "express";
import { search } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(search);

export default router;
