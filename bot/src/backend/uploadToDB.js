async function updateDriver(driverNumber, displayName, team, discordId) {
    const fetch = (await import('node-fetch')).default;
    const backendUrl = 'http://localhost:3000/update-driver/';  
    const url = `${backendUrl}${driverNumber}`;
    const body = {
        displayName,
        team,
        discordId
    };
    if (displayName === undefined || team === undefined || discordId === undefined) {
        throw new Error('All fields (displayName, team, discordId) must be included, even if null.');
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.text();  // Assuming the response is text, adjust if your API sends back JSON.
            throw new Error(`Failed to update driver: ${errorData}`);
        }

        return await response.text();  // Or `response.json()` if your API returns JSON.
    } catch (error) {
        console.error('Error updating driver data:', error);
        throw error;
    }
}

module.exports = updateDriver;
