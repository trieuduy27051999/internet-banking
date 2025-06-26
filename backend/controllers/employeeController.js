const employeeController = {
    getAll: (req, res) => {
        res.json([{ id: 1, name: 'Nguyen Van C' }, { id: 2, name: 'Le Thi D' }]);
    },
    getById: (req, res) => {
        const id = req.params.id;
        res.json({ id, name: 'Nguyen Van C' });
    },
    create: (req, res) => {
        const employee = req.body;
        res.status(201).json({ message: 'Employee created', employee });
    },
    update: (req, res) => {
        const id = req.params.id;
        const employee = req.body;
        res.json({ message: `Employee ${id} updated`, employee });
    },
    delete: (req, res) => {
        const id = req.params.id;
        res.json({ message: `Employee ${id} deleted` });
    }
};

module.exports = employeeController;