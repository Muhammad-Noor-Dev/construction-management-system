const assignmentRepository =
    require("../repositories/employeeSiteAssignmentRepository");


// Create assignment
const createAssignment = async (data) => {

    const {
        employeeId,
        siteId,
        startDate,
        endDate,
        dailyRateOverride
    } = data;


    // Check employee
    const employeeExists =
        await assignmentRepository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    // Check site
    const siteExists =
        await assignmentRepository.siteExists(
            siteId
        );


    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check duplicate
    const duplicate =
        await assignmentRepository.findDuplicateAssignment({
            employeeId,
            siteId,
            startDate
        });


    if (duplicate) {

        throw new Error(
            "This employee is already assigned to this site with the same start date"
        );
    }


    return await assignmentRepository.createAssignment({
        employeeId,
        siteId,
        startDate,
        endDate,
        dailyRateOverride
    });
};


// Get all
const getAllAssignments = async () => {

    return await assignmentRepository.findAllAssignments();
};


// Get one
const getAssignmentById = async (id) => {

    const assignment =
        await assignmentRepository.findAssignmentById(id);


    if (!assignment) {

        throw new Error(
            "Assignment not found"
        );
    }


    return assignment;
};


// Update
const updateAssignment = async (id, data) => {

    const existingAssignment =
        await assignmentRepository.findAssignmentById(id);


    if (!existingAssignment) {

        throw new Error(
            "Assignment not found"
        );
    }


    const {
        employeeId,
        siteId,
        startDate,
        endDate,
        dailyRateOverride
    } = data;


    // Check employee
    const employeeExists =
        await assignmentRepository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    // Check site
    const siteExists =
        await assignmentRepository.siteExists(
            siteId
        );


    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check duplicate
    const duplicate =
        await assignmentRepository.findDuplicateAssignment({
            employeeId,
            siteId,
            startDate,
            excludeId: Number(id)
        });


    if (duplicate) {

        throw new Error(
            "This employee is already assigned to this site with the same start date"
        );
    }


    return await assignmentRepository.updateAssignment(
        id,
        {
            employeeId,
            siteId,
            startDate,
            endDate,
            dailyRateOverride
        }
    );
};


// Delete
const deleteAssignment = async (id) => {

    const existingAssignment =
        await assignmentRepository.findAssignmentById(id);


    if (!existingAssignment) {

        throw new Error(
            "Assignment not found"
        );
    }


    return await assignmentRepository.deleteAssignment(
        id
    );
};


module.exports = {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment
};