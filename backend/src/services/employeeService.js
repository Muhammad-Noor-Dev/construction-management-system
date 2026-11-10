const employeeRepository = require("../repositories/employeeRepository");


const validatePaymentDetails = ({
    paymentType,
    monthlyGross,
    dailyRate
}) => {
    if (
        paymentType !== "Monthly Salaried" &&
        paymentType !== "Daily Rate"
    ) {
        throw new Error(
            'Payment type must be either "Monthly Salaried" or "Daily Rate"'
        );
    }

    if (paymentType === "Monthly Salaried") {
        if (
            monthlyGross === null ||
            monthlyGross === undefined
        ) {
            throw new Error(
                "Monthly gross is required for Monthly Salaried employees"
            );
        }

        if (Number(monthlyGross) <= 0) {
            throw new Error(
                "Monthly gross must be greater than 0"
            );
        }

        // Daily rate should not be used for monthly employees
        if (
            dailyRate !== null &&
            dailyRate !== undefined
        ) {
            throw new Error(
                "Daily rate must not be provided for Monthly Salaried employees"
            );
        }
    }

    if (paymentType === "Daily Rate") {
        if (
            dailyRate === null ||
            dailyRate === undefined
        ) {
            throw new Error(
                "Daily rate is required for Daily Rate employees"
            );
        }

        if (Number(dailyRate) <= 0) {
            throw new Error(
                "Daily rate must be greater than 0"
            );
        }

        // Monthly gross should not be used for daily employees
        if (
            monthlyGross !== null &&
            monthlyGross !== undefined
        ) {
            throw new Error(
                "Monthly gross must not be provided for Daily Rate employees"
            );
        }
    }
};


const createEmployee = async (data) => {
    const {
        fullName,
        cnic,
        phone,
        email,
        address,
        jobTitle,
        paymentType,
        monthlyGross,
        dailyRate,
        hireDate
    } = data;

    // Check whether CNIC already exists
    const existingEmployee =
        await employeeRepository.findEmployeeByCnic(cnic);

    if (existingEmployee) {
        throw new Error(
            "An employee with this CNIC already exists"
        );
    }

    // Validate payment rules
    validatePaymentDetails({
        paymentType,
        monthlyGross,
        dailyRate
    });

    const employee =
        await employeeRepository.createEmployee({
            fullName,
            cnic,
            phone,
            email,
            address,
            jobTitle,
            paymentType,
            monthlyGross,
            dailyRate,
            hireDate
        });

    return employee;
};


const getAllEmployees = async () => {
    return await employeeRepository.findAllEmployees();
};


const getEmployeeById = async (id) => {
    const employee =
        await employeeRepository.findEmployeeById(id);

    if (!employee) {
        throw new Error("Employee not found");
    }

    return employee;
};


const updateEmployee = async (id, data) => {
    const existingEmployee =
        await employeeRepository.findEmployeeById(id);

    if (!existingEmployee) {
        throw new Error("Employee not found");
    }

    // Check whether another employee already uses this CNIC
    const employeeWithCnic =
        await employeeRepository.findEmployeeByCnic(data.cnic);

    if (
        employeeWithCnic &&
        employeeWithCnic.id !== Number(id)
    ) {
        throw new Error(
            "Another employee with this CNIC already exists"
        );
    }

    // Validate payment rules
    validatePaymentDetails({
        paymentType: data.paymentType,
        monthlyGross: data.monthlyGross,
        dailyRate: data.dailyRate
    });

    return await employeeRepository.updateEmployee(
        id,
        data
    );
};


const deactivateEmployee = async (id) => {
    const existingEmployee =
        await employeeRepository.findEmployeeById(id);

    if (!existingEmployee) {
        throw new Error("Employee not found");
    }

    if (!existingEmployee.is_active) {
        throw new Error("Employee is already inactive");
    }

    return await employeeRepository.deactivateEmployee(id);
};


module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deactivateEmployee
};