const backend = require('../backend/backend');
const updateNumbermessage = require('../modules/updateNumbermessage');
// const ttvNotify = require('../modules/ttvNotify')
// const ytNotify = require('../modules/ytNotify')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client, interaction) {
        console.log(`Successfully logged in as: ${client.user.tag}`);

        if(!backend) return;

        try{
            await backend.execute();
            console.log("Database Connection successful");
        }
        catch(error){
            console.log("Database Connection failed: ",error);
        }
        try{
            await updateNumbermessage(client, interaction)
            console.log("Successfully updated number message");
        }
        catch{
            console.log("Failed to update number message");
        }

        try {
            await client.user.setActivity({
                name: `DEVELOPMENT`,
            });
            console.log("Presence set successfully.");
        } catch (error) {
            console.error("Error updating presence:", error);
        }
        
    }
};