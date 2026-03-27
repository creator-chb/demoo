"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
exports.default = router;
//# sourceMappingURL=product.js.map