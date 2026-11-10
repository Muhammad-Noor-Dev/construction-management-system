const repository =
    require("../repositories/payslipRepository");


// Create payslip
const createPayslip = async (payrollRecordId) => {

    // Check payroll record
    const recordExists =
        await repository.payrollRecordExists(
            payrollRecordId
        );


    if (!recordExists) {

        throw new Error(
            "Payroll record not found"
        );
    }


    // Check duplicate payslip
    const existingPayslip =
        await repository.findPayslipByPayrollRecordId(
            payrollRecordId
        );


    if (existingPayslip) {

        throw new Error(
            "Payslip already exists for this payroll record"
        );
    }


    return repository.createPayslip(
        payrollRecordId
    );
};


// Get all
const getAllPayslips = async () => {

    return repository.findAllPayslips();
};


// Get one
const getPayslipById = async (id) => {

    const payslip =
        await repository.findPayslipById(id);


    if (!payslip) {

        throw new Error(
            "Payslip not found"
        );
    }


    return payslip;
};


// Delete
const deletePayslip = async (id) => {

    const existing =
        await repository.findPayslipById(id);


    if (!existing) {

        throw new Error(
            "Payslip not found"
        );
    }


    return repository.deletePayslip(id);
};


module.exports = {
    createPayslip,
    getAllPayslips,
    getPayslipById,
    deletePayslip
};