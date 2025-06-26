const adminController = {
    getAll: (req, res) => {
        res.json([{ id: 1, name: 'Admin A' }, { id: 2, name: 'Admin B' }]);
    },
    getById: (req, res) => {
        const id = req.params.id;
        res.json({ id, name: 'Admin A' });
    },
    create: (req, res) => {
        const admin = req.body;
        res.status(201).json({ message: 'Admin created', admin });
    },
    update: (req, res) => {
        const id = req.params.id;
        const admin = req.body;
        res.json({ message: `Admin ${id} updated`, admin });
    },
    delete: (req, res) => {
        const id = req.params.id;
        res.json({ message: `Admin ${id} deleted` });
    }
};

module.exports = adminController;