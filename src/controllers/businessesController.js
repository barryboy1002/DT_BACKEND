import { getMpesaSettingsService, updateMpesaSettingsService } from "../services/businessesService.js";

async function getMpesaSettingsController(req, res, next) {
    const { businessId } = req.user;
    try {
        const settings = await getMpesaSettingsService(businessId);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

async function updateMpesaSettingsController(req, res, next) {
    const { businessId } = req.user;
    try {
        const settings = await updateMpesaSettingsService(businessId, req.body);
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

export { getMpesaSettingsController, updateMpesaSettingsController };
