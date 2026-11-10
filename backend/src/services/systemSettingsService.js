const repository =
    require("../repositories/systemSettingsRepository");

// CREATE
const createSetting = async (data) => {

    if (
        data.updated_by !== undefined &&
        data.updated_by !== null
    ) {
        const user =
            await repository.findUserById(
                data.updated_by
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }
    }

    const existing =
        await repository.findSettingByKey(
            data.setting_key
        );

    if (existing) {
        throw new Error(
            "Setting key already exists"
        );
    }

    return repository.createSetting({
        setting_key:
            data.setting_key,

        setting_value:
            data.setting_value,

        description:
            data.description ?? null,

        updated_by:
            data.updated_by ?? null
    });
};

// GET ALL
const getAllSettings = async () => {
    return repository.findAllSettings();
};

// GET BY KEY
const getSettingByKey = async (
    settingKey
) => {

    const setting =
        await repository.findSettingByKey(
            settingKey
        );

    if (!setting) {
        throw new Error(
            "Setting not found"
        );
    }

    return setting;
};

// GET BY ID
const getSettingById = async (id) => {

    const setting =
        await repository.findSettingById(id);

    if (!setting) {
        throw new Error(
            "Setting not found"
        );
    }

    return setting;
};

// UPDATE
const updateSetting = async (
    settingKey,
    data
) => {

    const existing =
        await repository.findSettingByKey(
            settingKey
        );

    if (!existing) {
        throw new Error(
            "Setting not found"
        );
    }

    if (
        data.updated_by !== undefined &&
        data.updated_by !== null
    ) {
        const user =
            await repository.findUserById(
                data.updated_by
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }
    }

    return repository.updateSetting(
        settingKey,
        {
            setting_value:
                data.setting_value,

            description:
                data.description ?? null,

            updated_by:
                data.updated_by ?? null
        }
    );
};

// DELETE
const deleteSetting = async (
    settingKey
) => {

    const existing =
        await repository.findSettingByKey(
            settingKey
        );

    if (!existing) {
        throw new Error(
            "Setting not found"
        );
    }

    return repository.deleteSetting(
        settingKey
    );
};

module.exports = {
    createSetting,
    getAllSettings,
    getSettingByKey,
    getSettingById,
    updateSetting,
    deleteSetting
};