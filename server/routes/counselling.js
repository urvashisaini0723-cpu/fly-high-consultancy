const express = require("express");
const { body, validationResult } = require("express-validator");
const { submitCounsellingEnquiry } = require("../controllers/counsellingController");

const router = express.Router();

const validateCounselling = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 80 }).withMessage("Name is too long"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9+\-\s()]{7,24}$/)
    .withMessage("Invalid phone number"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("consent").custom((v) => v === true || v === "true").withMessage("Consent is required"),
  body("contactMethod").optional().isIn(["WhatsApp", "Phone Call", "Email"]).withMessage("Invalid contact method"),
  body("cityState").optional().trim().isLength({ max: 80 }),
  body("interestedCountry").optional().trim().isLength({ max: 60 }),
  body("message").optional().trim().isLength({ max: 1000 }).withMessage("Message too long"),
  body("requirements").optional().isArray({ max: 10 }),
  body("quiz.preferredCountries").optional().isArray({ max: 8 }),
  body("quiz.recommendations").optional().isArray({ max: 5 }),
];

router.post("/", validateCounselling, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  return submitCounsellingEnquiry(req, res, next);
});

module.exports = router;
