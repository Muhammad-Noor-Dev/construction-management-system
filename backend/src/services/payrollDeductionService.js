const repository =
    require("../repositories/payrollDeductionRepository");


// Create
const createPayrollDeduction = async (data) => {

    const {
        payrollRecordId
    } = data;


    const recordExists =
        await repository.payrollRecordExists(
            payrollRecordId
        );


    if (!recordExists) {

        throw new Error(
            "Payroll record not found"
        );
    }


    return repository.createPayrollDeduction(data);
};


// Get all
const getAllPayrollDeductions = async () => {

    return repository.findAllPayrollDeductions();
};


// Get one
const getPayrollDeductionById = async (id) => {

    const deduction =
        await repository.findPayrollDeductionById(id);


    if (!deduction) {

        throw new Error(
            "Payroll deduction not found"
        );
    }


    return deduction;
};


// Update
const updatePayrollDeduction = async (
    id,
    data
) => {

    const existing =
        await repository.findPayrollDeductionById(id);


    if (!existing) {

        throw new Error(
            "Payroll deduction not found"
        );
    }


    const {
        payrollRecordId
    } = data;


    const recordExists =
        await repository.payrollRecordExists(
            payrollRecordId
        );


    if (!recordExists) {

        throw new Error(
            "Payroll record not found"
        );
    }


    return repository.updatePayrollDeduction(
        id,
        data
    );
};


// Delete
const deletePayrollDeduction = async (id) => {

    const existing =
        await repository.findPayrollDeductionById(id);


    if (!existing) {

        throw new Error(
            "Payroll deduction not found"
        );
    }


    return repository.deletePayrollDeduction(id);
};


module.exports = {
    createPayrollDeduction,
    getAllPayrollDeductions,
    getPayrollDeductionById,
    updatePayrollDeduction,
    deletePayrollDeduction
};