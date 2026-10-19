const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { sendContactMail } = require("../controllers/contactController");

const router = express.Router();

const validateContact = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 80 }),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9+\-\s]{7,16}$/)
    .withMessage("Invalid phone number"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("interest").trim().notEmpty().withMessage("Please select your interest"),
  body("message").optional().trim().isLength({ max: 1000 }).withMessage("Message too long"),
];

router.post("/", validateContact, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  return sendContactMail(req, res, next);
});

module.exports = router;
