const backend = require('../backend/backend');
const getData = require('../modules/getData');
// const ttvNotify = require('../modules/ttvNotify')
// const ytNotify = require('../modules/ytNotify')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if(!backend) return;

        try {
            await backend.execute();
            console.log("Database Connection successful");
        } catch(error) {
            console.log("Database Connection failed: ", error);
        }

        const drivers = await getData();
        const driverList = drivers.filter(driver => driver.driver_name != null).map(driver => driver.driver_name);

        console.log(`Successfully logged in as: ${client.user.tag}`);

        let randomDriver = String(getRandomDriver(driverList));

        try {
            await client.user.setActivity({
                name: `${randomDriver} beim Kurvenschneiden`,
                type: 'WATCHING'
            });
            console.log("Presence set successfully: " + randomDriver);
        } catch (error) {
            console.error("Error updating presence:", error);
        }
    }
};

function getRandomDriver(driverList) {
    const randomIndex = Math.floor(Math.random() * driverList.length);
    return driverList[randomIndex];
}
