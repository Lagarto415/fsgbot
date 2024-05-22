const { ActivityType } = require('discord.js');
const backend = require('../backend/backend');
const getData = require('../modules/getData');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        if (!backend) return;

        try {
            await backend.execute();
            console.log("Database Connection successful");
        } catch (error) {
            console.log("Database Connection failed: ", error);
        }

        const drivers = await getData();
        const driverList = drivers.filter(driver => driver.driver_name != null).map(driver => driver.driver_name);

        console.log(`Successfully logged in as: ${client.user.tag}`);

        // Define an array of statuses
        const statusArray = [
            { status: "online", type: ActivityType.Watching, name: "beim Fahren zu" },
        ];

        let currentIndex = 0;

        // Function to set presence
        function setPresence() {
            const option = Math.random() * driverList.length | 0;
            const { status, type, name } = statusArray[currentIndex % statusArray.length];

            try {
                client.user.setPresence({
                    activities: [{name:`${driverList[option]} ${name}`, type: type }],
                    status: status
                });
                currentIndex++;
            } catch (error) {
                console.error(error);
            }
        }

        // Initial presence
        setPresence();

        // Set presence every minute
        setInterval(() => {
            setPresence();
        }, 60000);
    }
};
