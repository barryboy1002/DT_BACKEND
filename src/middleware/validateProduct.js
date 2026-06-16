import {body, validationResult} from "express-validator";

export const validateProduct = [
    body("category_id")
    .trim()
    .isNumeric().withMessage("must have category")
    .custom(value => value > 0).withMessage("Category does not exist"),
    body ("name")
    .trim()
    .notEmpty().withMessage("product must have a name"),
    body("barcode")
    .optional()
    .trim()
    .isLength({max:500}).withMessage("Barcode is too long"),
    body("buying_price")
    .trim()
    .isNumeric().withMessage("price must be a number")
    .custom(value => value > 0).withMessage("price cannot be negative"),
    body("selling_price")
    .trim()
    .isNumeric().withMessage("price must be a number")
    .custom(value => value > 0).withMessage("price cannot be negative"),
    body("brand")
    .optional()
    .trim()
    .isLength({max:50}).withMessage("Brand is too long"),
    body("unit")
    .optional()
    .trim()
    .isLength({max:50}).withMessage("unit is too long"),
    body("description")
    .optional()
    .trim()
    .isLength({max:500}).withMessage("Barcode is too long"),

    (req,res,next) => {
        const errors =  validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next();
    }

    
]