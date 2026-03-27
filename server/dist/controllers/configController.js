"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const models_1 = require("../models");
const errorHandler_1 = require("../middleware/errorHandler");
// GET /api/config/:key - 获取系统配置
exports.getConfig = (0, errorHandler_1.asyncHandler)(async (req, res, next) => {
    const { key } = req.params;
    const config = await models_1.Config.findOne({
        where: { config_key: key }
    });
    if (!config) {
        return res.json({
            code: 404,
            message: '配置不存在',
            data: null
        });
    }
    res.json({
        code: 0,
        message: 'success',
        data: {
            key: config.config_key,
            value: config.config_value
        }
    });
});
//# sourceMappingURL=configController.js.map