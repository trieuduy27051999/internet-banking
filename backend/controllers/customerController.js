const customerController = {
    getAll: (req, res) => {
        res.json([{ id: 1, name: 'Nguyen Van A' }, { id: 2, name: 'Tran Thi B' }]);
    },
    getById: (req, res) => {
        const id = req.params.id;
        res.json({ id, name: 'Nguyen Van A' });
    },
    create: (req, res) => {
        const customer = req.body;
        res.status(201).json({ message: 'Customer created', customer });
    },
    update: (req, res) => {
        const id = req.params.id;
        const customer = req.body;
        res.json({ message: `Customer ${id} updated`, customer });
    },
    delete: (req, res) => {
        const id = req.params.id;
        res.json({ message: `Customer ${id} deleted` });
    }
};

module.exports = customerController;