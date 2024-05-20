async function updateDriver(driverNumber, displayName, team, discordId) {
    // Log variables before passing them to updateDriver
    console.log(`Attempting to update driver: driverNumber=${driverNumber}, displayName=${displayName}, team=${team}, discordId=${discordId}`);

    // Ensure all variables are not undefined or null
    if (!driverNumber || !displayName || !team || !discordId) {
        console.error('One or more required fields are missing');
        return interaction.reply({ content: 'Einige Felder fehlen. Bitte erneut versuchen.', ephemeral: true });
    }

    const fetch = (await import('node-fetch')).default;
    // Check for undefined fields before proceeding
    if (!driverNumber || displayName === undefined || team === undefined || discordId === undefined) {
        throw new Error('All fields (driverNumber, displayName, team, discordId) must be included.');
    }

    // Construct the dynamic URL with driver number
    const backendUrl = `http://localhost:3000/update-driver/${encodeURIComponent(driverNumber)}`;
    const body = {
        displayName,
        team,
        discordId
    };

    try {
        // Log request information for debugging
        console.log(`Sending PUT request to ${backendUrl} with body:`, body);

        // Make the HTTP request
        const response = await fetch(backendUrl, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Backend error: ${response.status} - ${response.statusText}: ${errorData}`);
            throw new Error(`Failed to update driver: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Error updating driver data:', error);
        throw error;
    }
}

module.exports = updateDriver;
