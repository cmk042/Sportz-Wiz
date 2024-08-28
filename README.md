# Sportz-Wiz

## Description:
Sportz Wiz is a sports statistics Website designed for researching specific player averages. Choose customized settings to find specific averages for players in the NBA, NFL, MLB, and NHL. As of the most recent version, the respective subsites for the NHL, NFL, and MLB are under development. This project also features the web scraping code I made to scrape https://www.nba.com/ of box scores for the 2003-2023 NBA seasons.

## Table of Contents
1. [Overview](#Overview)
2. [Features](#Features)
3. [Built With](#Built With)
4. [Installation](#Installation)
5. [Usage](#usage)
7. [License](#license)
8. [Contact](#contact)

## Overview:
Sportz Wiz aims to be a comprehensive player statistics website designed to recognize patterns in performance. Its filter options allow for users to analyze players averages in specific circumstances (e.g home games, against specific teams, etc.) to aid in prediction. Sportz Wiz is not explicitly intended to be a sports betting tool, but its features can provide valuable insights and trends that may be useful for making informed decisions and predictions.

## Features: 
Currently this project features:
- A Homepage and Subsites: A central hub site that links to the respective sites for each league.
- NBA player lookup with filter options: Search for a player and obtain statistics.
- NBA Player Webscraper: The code I designed to obtain box scores from every regular season and playoff game from the 2003-2023 seasons.

## Built With:
- Selenium: Used for webdriving and scraping.
- Chromedriver: Used for webdriving and scraping.
- NBA.com: Source of NBA statistics and players.

## Installation:
Only a web browser is necessary to use Sportz Wiz. To clone the repository, use:

git clone https://github.com/cmk042/Sportz-Wiz.git

Once cloned, open the html file Home_Page.html in your preffered web browser.

Alternatively, you can use the following command to start a simple HTTP server and open the project in your browser:

python3 -m http.server

Then navigate to http://localhost:8000 in your browser.

## Usage:
When using Sportz Wiz, navigate to your prefferred league from the Home Screen. From there, select a player, and your preffered ways of filtering their career statistics. After all choosing all settings, press the Submit button to generate their averages.

## Liscense:
There is currently no liscense on Sportz Wiz.

## Contact:
Sportz Wiz was designed by Casey King.

Contact me at: 
cmk042@bucknell.edu
