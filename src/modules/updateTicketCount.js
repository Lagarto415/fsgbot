module.exports = async (data) => {
    const fetch = (await import('node-fetch')).default;
    const port = process.env.DBPORT || 3000;
    try {
      const response = await fetch(`http://localhost:${port}/fsg/ticketCount/${data.guildId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log('Successfully updated ticketCount');
    } catch (error) {
      console.error('Failed to update ticketCount:', error);
      throw error;
    }
  };
  