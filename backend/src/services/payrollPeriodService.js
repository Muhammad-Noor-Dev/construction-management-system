const repository =
    require("../repositories/payrollPeriodRepository");

const allowedStatusTransitions = {
    "Draft": ["Draft", "Prepared"],
    "Prepared": ["Prepared", "Under Review", "Draft"],
    "Under Review": ["Under Review", "Approved", "Prepared"],
    "Approved": ["Approved", "Paid"],
    "Paid": ["Paid"]
};


const validateStatusTransition = (
    currentStatus,
    newStatus
) => {

    const allowed =
        allowedStatusTransitions[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {

        throw new Error(
            `Invalid payroll status transition from ${currentStatus} to ${newStatus}`
        );
    }
};
// Create
const createPayrollPeriod = async (data) => {

    const {
        year,
        month,
        status,
        preparedBy,
        approvedBy,
        rejectionReason
    } = data;


    const duplicate =
        await repository.findDuplicatePeriod({
            year,
            month
        });


    if (duplicate) {

        throw new Error(
            "Payroll period already exists for this year and month"
        );
    }


    if (
        preparedBy !== null &&
        preparedBy !== undefined
    ) {

        const exists =
            await repository.userExists(
                preparedBy
            );


        if (!exists) {

            throw new Error(
                "Prepared by user not found"
            );
        }
    }


    if (
        approvedBy !== null &&
        approvedBy !== undefined
    ) {

        const exists =
            await repository.userExists(
                approvedBy
            );


        if (!exists) {

            throw new Error(
                "Approved by user not found"
            );
        }
    }


    return repository.createPayrollPeriod(data);
};


// Get all
const getAllPayrollPeriods = async () => {

    return repository.findAllPayrollPeriods();
};


// Get one
const getPayrollPeriodById = async (id) => {

    const period =
        await repository.findPayrollPeriodById(id);


    if (!period) {

        throw new Error(
            "Payroll period not found"
        );
    }


    return period;
};


// Update
const updatePayrollPeriod = async (id, data) => {

    const existing =
        await repository.findPayrollPeriodById(id);


    if (!existing) {

        throw new Error(
            "Payroll period not found"
        );
    }

    validateStatusTransition(
    existing.status,
    data.status
);


    const {
        year,
        month,
        preparedBy,
        approvedBy
    } = data;


    const duplicate =
        await repository.findDuplicatePeriod({
            year,
            month,
            excludeId: Number(id)
        });


    if (duplicate) {

        throw new Error(
            "Payroll period already exists for this year and month"
        );
    }


    if (
        preparedBy !== null &&
        preparedBy !== undefined
    ) {

        const exists =
            await repository.userExists(
                preparedBy
            );


        if (!exists) {

            throw new Error(
                "Prepared by user not found"
            );
        }
    }


    if (
        approvedBy !== null &&
        approvedBy !== undefined
    ) {

        const exists =
            await repository.userExists(
                approvedBy
            );


        if (!exists) {

            throw new Error(
                "Approved by user not found"
            );
        }
    }


    return repository.updatePayrollPeriod(
        id,
        data
    );
};


// Delete
const deletePayrollPeriod = async (id) => {

    const existing =
        await repository.findPayrollPeriodById(id);


    if (!existing) {

        throw new Error(
            "Payroll period not found"
        );
    }


    return repository.deletePayrollPeriod(id);
};


module.exports = {
    createPayrollPeriod,
    getAllPayrollPeriods,
    getPayrollPeriodById,
    updatePayrollPeriod,
    deletePayrollPeriod
};