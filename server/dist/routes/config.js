"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configController_1 = require("../controllers/configController");
const router = (0, express_1.Router)();
router.get('/:key', configController_1.getConfig);
exports.default = router;
//# sourceMappingURL=config.js.map