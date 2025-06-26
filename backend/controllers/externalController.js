const { PartnerBank } = require('../models');

const externalController = {
    getAll: async (req, res) => {
        try {
            const banks = await PartnerBank.findAll();
            res.json(banks);
        } catch (err) {
            res.status(500).json({ error: 'Không thể tải danh sách ngân hàng đối tác.' });
        }
    },
    getById: async (req, res) => {
        try {
            const bank = await PartnerBank.findByPk(req.params.id);
            if (!bank) return res.status(404).json({ error: 'Không tìm thấy ngân hàng.' });
            res.json(bank);
        } catch (err) {
            res.status(500).json({ error: 'Lỗi khi lấy thông tin ngân hàng.' });
        }
    },
    create: async (req, res) => {
        try {
            const bank = await PartnerBank.create(req.body);
            res.status(201).json({ message: 'Đã tạo ngân hàng đối tác', bank });
        } catch (err) {
            res.status(500).json({ error: 'Không thể tạo ngân hàng.' });
        }
    },
    update: async (req, res) => {
        try {
            const bank = await PartnerBank.findByPk(req.params.id);
            if (!bank) return res.status(404).json({ error: 'Không tìm thấy ngân hàng.' });
            await bank.update(req.body);
            res.json({ message: `Đã cập nhật ngân hàng ${bank.id}`, bank });
        } catch (err) {
            res.status(500).json({ error: 'Không thể cập nhật ngân hàng.' });
        }
    },
    delete: async (req, res) => {
        try {
            const bank = await PartnerBank.findByPk(req.params.id);
            if (!bank) return res.status(404).json({ error: 'Không tìm thấy ngân hàng.' });
            await bank.destroy();
            res.json({ message: `Đã xóa ngân hàng ${bank.id}` });
        } catch (err) {
            res.status(500).json({ error: 'Không thể xóa ngân hàng.' });
        }
    }
};

module.exports = externalController;