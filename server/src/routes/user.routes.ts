import express from "express";
import { CreateUserSchema } from "../validators/user.schema";
import { validate } from "../middlewares/validate";

const router = express.Router();

router.post(
  "/",
  validate(CreateUserSchema),
  (req, res) => {
    res.status(201).json(req.body);
  }
);

export default router;
