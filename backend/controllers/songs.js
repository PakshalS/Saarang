const getuserplaylist = async(req, res) => {
   try{
  const accessToken = req.headers.authorization.split(' ')[1];  // Extract Bearer token

  // Call Spotify API to fetch user's playlists
  fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => res.json(data))
}catch(error)
{
    console.error("Error creating group:", error);
    res.status(500).json({ error: error.message || "Failed to get user playlist" });
}
};

module.exports ={
    getuserplaylist
}