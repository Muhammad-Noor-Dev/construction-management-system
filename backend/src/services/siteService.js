const siteRepository =
    require("../repositories/siteRepository");


const createSite = async (data) => {

    const {
        projectId,
        name,
        location
    } = data;


    const projectExists =
        await siteRepository.projectExists(
            projectId
        );


    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    const existingSite =
        await siteRepository.findSiteByProjectAndName(
            projectId,
            name
        );


    if (existingSite) {

        throw new Error(
            "A site with this name already exists in this project"
        );
    }


    return await siteRepository.createSite({
        projectId,
        name: name.trim(),
        location: location ? location.trim() : null
    });
};


const getAllSites = async () => {

    return await siteRepository.findAllSites();
};


const getSiteById = async (id) => {

    const site =
        await siteRepository.findSiteById(id);


    if (!site) {

        throw new Error(
            "Site not found"
        );
    }


    return site;
};


const updateSite = async (id, data) => {

    const existingSite =
        await siteRepository.findSiteById(id);


    if (!existingSite) {

        throw new Error(
            "Site not found"
        );
    }


    const {
        projectId,
        name,
        location
    } = data;


    const projectExists =
        await siteRepository.projectExists(
            projectId
        );


    if (!projectExists) {

        throw new Error(
            "Project not found"
        );
    }


    const siteWithSameName =
        await siteRepository.findSiteByProjectAndName(
            projectId,
            name
        );


    if (
        siteWithSameName &&
        siteWithSameName.id !== Number(id)
    ) {

        throw new Error(
            "A site with this name already exists in this project"
        );
    }


    return await siteRepository.updateSite(
        id,
        {
            projectId,
            name: name.trim(),
            location: location ? location.trim() : null
        }
    );
};


const deleteSite = async (id) => {

    const existingSite =
        await siteRepository.findSiteById(id);


    if (!existingSite) {

        throw new Error(
            "Site not found"
        );
    }


    return await siteRepository.deleteSite(id);
};


module.exports = {
    createSite,
    getAllSites,
    getSiteById,
    updateSite,
    deleteSite
};