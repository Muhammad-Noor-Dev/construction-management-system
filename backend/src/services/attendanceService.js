const attendanceRepository =
    require("../repositories/attendanceRepository");


// Create attendance
const createAttendance = async (data) => {

    const {
        employeeId,
        siteId,
        attendanceDate,
        status,
        recordedBy
    } = data;


    // Check employee
    const employeeExists =
        await attendanceRepository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    // Check site
    const siteExists =
        await attendanceRepository.siteExists(
            siteId
        );


    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check recorded-by user
    if (recordedBy !== null && recordedBy !== undefined) {

        const userExists =
            await attendanceRepository.userExists(
                recordedBy
            );


        if (!userExists) {

            throw new Error(
                "Recording user not found"
            );
        }
    }


    // Check duplicate
    const duplicate =
        await attendanceRepository.findDuplicateAttendance({
            employeeId,
            attendanceDate
        });


    if (duplicate) {

        throw new Error(
            "Attendance has already been recorded for this employee on this date"
        );
    }


    return await attendanceRepository.createAttendance({
        employeeId,
        siteId,
        attendanceDate,
        status,
        recordedBy
    });
};


// Get all
const getAllAttendance = async () => {

    return await attendanceRepository.findAllAttendance();
};


// Get one
const getAttendanceById = async (id) => {

    const attendance =
        await attendanceRepository.findAttendanceById(id);


    if (!attendance) {

        throw new Error(
            "Attendance record not found"
        );
    }


    return attendance;
};


// Update
const updateAttendance = async (id, data) => {

    const existingAttendance =
        await attendanceRepository.findAttendanceById(id);


    if (!existingAttendance) {

        throw new Error(
            "Attendance record not found"
        );
    }


    const {
        employeeId,
        siteId,
        attendanceDate,
        status,
        recordedBy
    } = data;


    // Check employee
    const employeeExists =
        await attendanceRepository.employeeExists(
            employeeId
        );


    if (!employeeExists) {

        throw new Error(
            "Employee not found"
        );
    }


    // Check site
    const siteExists =
        await attendanceRepository.siteExists(
            siteId
        );


    if (!siteExists) {

        throw new Error(
            "Site not found"
        );
    }


    // Check recorded-by user
    if (recordedBy !== null && recordedBy !== undefined) {

        const userExists =
            await attendanceRepository.userExists(
                recordedBy
            );


        if (!userExists) {

            throw new Error(
                "Recording user not found"
            );
        }
    }


    // Check duplicate
    const duplicate =
        await attendanceRepository.findDuplicateAttendance({
            employeeId,
            attendanceDate,
            excludeId: Number(id)
        });


    if (duplicate) {

        throw new Error(
            "Attendance has already been recorded for this employee on this date"
        );
    }


    return await attendanceRepository.updateAttendance(
        id,
        {
            employeeId,
            siteId,
            attendanceDate,
            status,
            recordedBy
        }
    );
};


// Delete
const deleteAttendance = async (id) => {

    const existingAttendance =
        await attendanceRepository.findAttendanceById(id);


    if (!existingAttendance) {

        throw new Error(
            "Attendance record not found"
        );
    }


    return await attendanceRepository.deleteAttendance(
        id
    );
};


module.exports = {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
};