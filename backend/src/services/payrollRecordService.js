const repository =
    require("../repositories/payrollRecordRepository");


// Validate day calculations
const validateDays = ({
    workingDays,
    presentDays,
    absentDays
}) => {

    if (presentDays + absentDays !== workingDays) {

        throw new Error(
            "Present days plus absent days must equal working days"
        );
    }
};


// Create
const createPayrollRecord = async (data) => {

    const {
        payrollPeriodId,
        employeeId,
        workingDays,
        presentDays,
        absentDays
    } = data;


    const periodExists =
        await repository.payrollPeriodExists(
            payrollPeriodId
        );


    if (!periodExists) {

        throw new Error(
            "Payroll period not found"
        );
    }


    const employeeExists =
        await repository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    const duplicate =
        await repository.findDuplicatePayrollRecord({
            payrollPeriodId,
            employeeId
        });


    if (duplicate) {

        throw new Error(
            "Payroll record already exists for this employee in this payroll period"
        );
    }


    validateDays({
        workingDays,
        presentDays,
        absentDays
    });


    return repository.createPayrollRecord(data);
};


// Get all
const getAllPayrollRecords = async () => {

    return repository.findAllPayrollRecords();
};


// Get one
const getPayrollRecordById = async (id) => {

    const record =
        await repository.findPayrollRecordById(id);


    if (!record) {

        throw new Error(
            "Payroll record not found"
        );
    }


    return record;
};


// Update
const updatePayrollRecord = async (id, data) => {

    const existing =
        await repository.findPayrollRecordById(id);


    if (!existing) {

        throw new Error(
            "Payroll record not found"
        );
    }


    const {
        payrollPeriodId,
        employeeId,
        workingDays,
        presentDays,
        absentDays
    } = data;


    const periodExists =
        await repository.payrollPeriodExists(
            payrollPeriodId
        );


    if (!periodExists) {

        throw new Error(
            "Payroll period not found"
        );
    }


    const employeeExists =
        await repository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    const duplicate =
        await repository.findDuplicatePayrollRecord({
            payrollPeriodId,
            employeeId,
            excludeId: Number(id)
        });


    if (duplicate) {

        throw new Error(
            "Payroll record already exists for this employee in this payroll period"
        );
    }


    validateDays({
        workingDays,
        presentDays,
        absentDays
    });


    return repository.updatePayrollRecord(
        id,
        data
    );
};


// Delete
const deletePayrollRecord = async (id) => {

    const existing =
        await repository.findPayrollRecordById(id);


    if (!existing) {

        throw new Error(
            "Payroll record not found"
        );
    }


    return repository.deletePayrollRecord(id);
};


module.exports = {
    createPayrollRecord,
    getAllPayrollRecords,
    getPayrollRecordById,
    updatePayrollRecord,
    deletePayrollRecord
};