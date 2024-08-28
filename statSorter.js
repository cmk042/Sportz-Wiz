document.addEventListener('DOMContentLoaded', function() {
    // Get HTML elements, such as serach bars and button groups
    const playerSearch = document.getElementById('player-search');
    const suggestions = document.getElementById('suggestions');
    const locSelect = document.getElementsByClassName('location-button-group')[0];
    const againstSelect = document.getElementsByClassName('against-button-group')[0];
    const withSelect = document.getElementsByClassName('with-button-group')[0];
    const withSearch = document.getElementsByClassName('team-search-with')[0];
    const againstSearch = document.getElementsByClassName('team-search-against')[0];
    const seasonSelect = document.getElementsByClassName('season-button-group')[0];
    const gamesSelect = document.getElementsByClassName('games-button-group')[0];
    const searchButton = document.getElementsByClassName('submit-button')[0];

    // Start path to folder with NBA stats
    const pathStart = 'NBA_Stats/';

    // Player selected to view
    let selectedPlayer = '';

    // Start and end dates for date option
    let startDate = '';
    let endDate = '';

    // Option of what games to show
    let selectedGamesOption;

    // All NBA Teams abreviated
    const nbaTeams = [
        "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
        "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
        "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
    ];

    // Stats to be displayed
    let displayStats = {
        "Minutes": 0,
        "Points": 0,
        "FGM": 0,
        "FGA": 0,
        "FG%": 0,
        "3PM": 0,
        "3PA": 0,
        "3P%": 0,
        "FTM": 0,
        "FTA": 0,
        "FT%": 0,
        "OREB": 0,
        "DREB": 0,
        "REB": 0,
        "AST": 0,
        "STL": 0,
        "BLK": 0,
        "TOV": 0,
        "PF": 0,
        "+/-": 0,
        "FP": 0
    };
    
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = ''; // Clear any previous stats

    // Handle team suggestions
    document.getElementById('team-search-with').addEventListener('input', function() {
        filterTeams(this.value, 'suggestions-with');
    });
    document.getElementById('team-search-against').addEventListener('input', function() {
        filterTeams(this.value, 'suggestions-against');
    });

    // For Player search bar: Handles inputs
    fetch('current_players.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        // Get through data and get players
        .then(data => {
            const players = data.players;

            playerSearch.addEventListener('input', function() {
                const input = playerSearch.value.toLowerCase();
                suggestions.innerHTML = '';

                // Give suggestions
                if (input) {
                    const filteredPlayers = players.filter(player =>
                        player.toLowerCase().includes(input)
                    ).slice(0, 10);

                    filteredPlayers.forEach(player => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('suggestion-item');
                        suggestionItem.textContent = player;
                        suggestions.appendChild(suggestionItem);

                        suggestionItem.addEventListener('click', function() {
                            playerSearch.value = player; // Set the search input to the selected player's name
                            suggestions.innerHTML = ''; // Clear the suggestions list
                            selectedPlayer = player; // Save the selected player's name
                        });
                    });
                }
            });
        })
        .catch(error => console.error('Error loading player names:', error));

        // If Handle a stat search
        searchButton.addEventListener('click', async function() {
            if (selectedPlayer !== '') {
                // count games
                let numGames = 0;
                let gamesLimit = 0;
                displayStats = Object.keys(displayStats).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

                // Get files for seasons
                let seasons = await fetchNeededSeasons(selectedPlayer);
        
                // Get games from input if button is checked
                if (document.getElementById('last-games').checked) {
                    gamesLimit = parseInt(document.getElementById('games-input').value) || 0;
                }

                // Get all selected options
                let selectedLocOption = document.querySelector('input[name="location-option"]:checked').id;
                let selectedAgainstOption = document.querySelector('input[name="against-option"]:checked').id;
                let selectedWithOption = document.querySelector('input[name="with-option"]:checked').id;
                let againstTeam = document.getElementById('team-search-against').value.trim().toUpperCase();
                let withTeam = document.getElementById('team-search-with').value.trim().toUpperCase();  
        
                // Go through files filtering games
                for (let filePath of seasons) {
                    await fetch(filePath)
                        .then(response => {
                            if (!response.ok) {
                                console.warn('File not found or inaccessible:', filePath);
                                return; // Move to the next file
                            }
                            return response.json();
                        })
                        .then(data => {
                            if (!data) return; // Skip if data is null due to missing file                          
        
                            // Go through each game in data and skip accordingly
                            for (let game of data) {
                                if (selectedLocOption === 'home' && game["Match Up"].includes('@')) continue;
                                if (selectedLocOption === 'away' && !game["Match Up"].includes('@')) continue;
                                if (selectedAgainstOption === 'against-choice' && againstTeam !== game["Match Up"].slice(-3)) {continue};
                                if (selectedWithOption === 'with-choice' && withTeam !== game["Team"]) continue;
                                if (selectedGamesOption === 'date-range'){
                                    let gameDate = new Date(game["Date"]);
                                    let startDateObj = new Date(startDate);
                                    let endDateObj = new Date(endDate);
                                    if(gameDate < startDateObj || gameDate > endDateObj) continue;
                                }
        
                                // Stop if the game limit is reached
                                if (gamesLimit > 0 && numGames >= gamesLimit) break;
        
                                // Add stats to totals
                                for (let key in displayStats) {
                                    if(key.includes("%")){continue;}
                                    displayStats[key] += parseInt(game[key]);
                                }
                                numGames++;
                                if(numGames == gamesLimit) {break;}
                            }
                        })
                        .catch(error => console.error('Error loading JSON:', error));
                }
        
                if (numGames > 0) {
                    // Calculate percentages
                    if(displayStats['3PA'] == 0){displayStats['3P%'] = '-';}
                    else{displayStats["3P%"] = displayStats["3PM"]/displayStats["3PA"]*100;}
                    if(displayStats['FGA'] == 0){displayStats['FG%'] = '-';}
                    else{displayStats["FG%"] = displayStats["FGM"]/displayStats["FGA"]*100;}
                    if(displayStats['FTA'] == 0){displayStats['FT%'] = '-';}
                    else{displayStats["FT%"] = displayStats["FTM"]/displayStats["FTA"]*100;}
        
                    // Divide stats by number of games for averages
                    for (let key in displayStats) {
                        if(key.includes("%")){continue;}
                        displayStats[key] /= numGames;
                    }
                } else {
                    console.error("No games found to calculate stats.");
                }

                 // Clear any previous stats
                statsList.innerHTML = '';
        
                // Display stats
                for (let key in displayStats) {
                    const statItem = document.createElement('li');
                    statItem.textContent = `${key}: ${displayStats[key].toFixed(2)}`;
                    statsList.appendChild(statItem);
                }
        
                console.log(displayStats); // For debugging purposes
            }
        });
        

    /**
     *   Fetches seasons based on button inputs
     * */
    async function fetchNeededSeasons(selectedPlayer) {
        // Make path
        let playerPath = pathStart + selectedPlayer;
        let seasons = [];
        // Get selected games option
        selectedGamesOption = document.querySelector('input[name="games-option"]:checked').id;
        let selectedSeasonOption = document.querySelector('input[name="season-option"]:checked').id;
    
        // if last season put 23 season in list, account for playoffs
        if (selectedGamesOption === 'last-season') {
            if (selectedSeasonOption === 'regular-season') {
                seasons.push(playerPath + '/reg_23.json');
            } else if (selectedSeasonOption === 'playoffs') {
                seasons.push(playerPath + '/playoff_23.json');
            } else {
                seasons.push(playerPath + '/reg_23.json', playerPath + '/playoff_23.json');
            }
            // get possible included seasons given a date range
        } else if (selectedGamesOption === 'date-range') {
            startDate = document.getElementById('start-date').value;
            endDate = document.getElementById('end-date').value;
            let startYear = parseInt(startDate.substring(2, 4));
            let endYear = parseInt(endDate.substring(2, 4));
            for (let year = 23; year >= 3; year--) {
                if (startYear > year) break;
                if (endYear < year) continue;
    
                console.log('Checking paths for year:', year); // Debug log
    
                if (selectedSeasonOption === 'regular-season' || selectedSeasonOption === 'season-all') {
                    let regPath = playerPath + '/reg_' + year + '.json';
                    console.log('Checking file:', regPath); // Log for debugging
                    if (await fileExists(regPath)) {
                        seasons.push(regPath);
                    }
                }
                if (selectedSeasonOption === 'playoffs' || selectedSeasonOption === 'season-all') {
                    let playoffPath = playerPath + '/playoff_' + year + '.json';
                    console.log('Checking file:', playoffPath); // Log for debugging
                    if (await fileExists(playoffPath)) {
                        seasons.push(playoffPath);
                    }
                }
            }
        } else {
            // Get every file
            for (let year = 23; year >= 3; year--) {
                console.log('Checking paths for year:', year); // Debug log
    
                if (selectedSeasonOption === 'regular-season' || selectedSeasonOption === 'season-all') {
                    let regPath = playerPath + '/reg_' + year + '.json';
                    console.log('Checking file:', regPath); // Log for debugging
                    if (await fileExists(regPath)) {
                        seasons.push(regPath);
                    }
                }
                if (selectedSeasonOption === 'playoffs' || selectedSeasonOption === 'season-all') {
                    let playoffPath = playerPath + '/playoff_' + year + '.json';
                    console.log('Checking file:', playoffPath); // Log for debugging
                    if (await fileExists(playoffPath)) {
                        seasons.push(playoffPath);
                    }
                }
            }
        }
        return seasons;
    }    

    /**
     * Check If file exists
     */
    async function fileExists(filePath) {
        try {
            let response = await fetch(filePath, { method: 'HEAD' });
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('File not found:', filePath);
                } else {
                    throw new Error('Error accessing file: ' + filePath + ' (Status: ' + response.status + ')');
                }
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking file:', filePath, error.message);
            return false;
        }
    }

    /**
     * Filter teams for suggestions
     * @param {*} query 
     * @param {*} suggestionsElementId 
     */
    function filterTeams(query, suggestionsElementId) {
        const suggestionsElement = document.getElementById(suggestionsElementId);
        suggestionsElement.innerHTML = ''; // Clear previous suggestions
    
        if (query) {
            const filteredTeams = nbaTeams.filter(team => team.startsWith(query.toUpperCase()));
    
            filteredTeams.forEach(team => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = team;
    
                // Set the selected team when a suggestion is clicked
                suggestionItem.addEventListener('click', function() {
                    document.getElementById(suggestionsElementId.replace('suggestions-', 'team-search-')).value = team;
                    suggestionsElement.innerHTML = ''; // Clear the suggestions after selection
                });
    
                suggestionsElement.appendChild(suggestionItem);
            });
        }
    }
});