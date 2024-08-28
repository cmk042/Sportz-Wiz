from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import os
import csv
import json

# Class to Scrape for NBA box scores and save players' statistical seasons
class NBACollector:
    url_start = "https://www.nba.com/stats/players/boxscores?Season="
    reg_url = "&SeasonType=Regular+Season"
    playoff_url = "&SeasonType=Playoffs"
    NBA_directory = "NBA_Stats/"
    stats_database = {}
    
    # Makes URL, scrapes data, and saves season to csv
    def collect_season(self, season, reg_season):
        # Make the URL based on year and part of season
        if reg_season:
            if season == 9:
                full_url = "https://www.nba.com/stats/players/boxscores?Season=2009-10&SeasonType=Regular+Season"
            elif season > 9:
                full_url = f"{self.url_start}20{season}-{season+1}{self.reg_url}"
            else:
                full_url = f"{self.url_start}200{season}-0{season+1}{self.reg_url}"  
        else:
            if season == 9:
                full_url = "https://www.nba.com/stats/players/boxscores?Season=2009-10&SeasonType=Playoffs"
            elif season > 9:
                full_url = f"{self.url_start}20{season}-{season+1}{self.playoff_url}"
            else:
                full_url = f"{self.url_start}200{season}-0{season+1}{self.playoff_url}"

        self.use_driver(full_url, reg_season, season)		
        self.add_data_to_csvs(reg_season, season)        
        print(f"Successfully Scraped Data for {season}-{season+1} season")     

    # Adds saved data to csv
    def add_data_to_csvs(self, reg_season, season):
        # loops through players and makes csv file named accordingly
        for player in self.stats_database:
            directory_path = os.path.join(self.NBA_directory, player)
            try:
                os.makedirs(directory_path, exist_ok=True)
            except Exception as e:
                print(f"Error with file creation: {e}")
            
            if reg_season:
                file_name = os.path.join(directory_path, f"reg_{season}.csv")
            else:
                file_name = os.path.join(directory_path, f"playoff_{season}.csv")
            
            with open(file_name, mode='w', newline='') as file:
                writer = csv.writer(file)  
                writer.writerows(self.stats_database[player])
        self.stats_database = {}    

    # Goes through webpage getting statistics
    def use_driver(self, full_url, reg_season, season):
        # Set up ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)

        # Open the webpage
        driver.get(full_url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "Crom_table__p1iZz")))
        page_num = 1            
        try:
            # Get number of pages in season
            dropdowns = driver.find_elements(By.CLASS_NAME, "DropDown_select__4pIg9")
            select = Select(dropdowns[2])
            options = select.options
            num_pages = len(options)
            
            # Loop through pages
            while page_num <= num_pages - 1:
                table = driver.find_element(By.CLASS_NAME, "Crom_table__p1iZz")
                rows = table.find_elements(By.TAG_NAME, "tr")
                # Append data to stats_database
                for row in rows[1:]:
                    cells = row.find_elements(By.TAG_NAME, "td")
                    row_data = [cell.text for cell in cells[1:]]
                    if cells[0].text not in self.stats_database:
                        self.stats_database[cells[0].text] = []
                    self.stats_database[cells[0].text].append(row_data)
                
                print(f"Page {page_num}/{num_pages} Complete.")        
                buttons = driver.find_elements(By.CLASS_NAME, "Pagination_button__sqGoH")
                try:
                    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(buttons[1]))
                    driver.execute_script("arguments[0].scrollIntoView(true);", buttons[1])
                    buttons[1].click()
                except Exception as e:
                    driver.execute_script("arguments[0].click();", buttons[1])
                page_num += 1   

        finally:
            # Close the browser
            driver.quit()

    # Gets all names of current players
    def get_current_player_names(self):
        url = "https://www.nba.com/players"
        # Set up ChromeDriver
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)

        # Open the webpage
        driver.get(url)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "players-list")))
        page_num = 1
        dropdowns = driver.find_elements(By.CLASS_NAME, "DropDown_select__4pIg9")
        select = Select(dropdowns[5])
        options = select.options
        num_pages = len(options)
        player_names = []
        
        # Loop through pages collecting names
        while page_num <= num_pages - 1:
            table = driver.find_element(By.CLASS_NAME, "players-list")
            rows = table.find_elements(By.TAG_NAME, "tr")
            for row in rows[1:]:
                cells = row.find_elements(By.TAG_NAME, "td")
                player_names.append(cells[0].text)
            
            print(f"Page {page_num}/{num_pages} Complete.")        
            buttons = driver.find_elements(By.CLASS_NAME, "Pagination_button__sqGoH")
            try:
                WebDriverWait(driver, 10).until(EC.element_to_be_clickable(buttons[1]))
                driver.execute_script("arguments[0].scrollIntoView(true);", buttons[1])
                buttons[1].click()
            except Exception as e:
                driver.execute_script("arguments[0].click();", buttons[1])
            page_num += 1
        player_data = {"players": player_names}
        json_file_path = 'NBA_Stats/current_players.json'
        with open(json_file_path, 'w') as json_file:
            json.dump(player_data, json_file, indent=4)
        driver.quit()

# Main Method, collects player names, can be edited to collect seasons.
def main():
    collector = NBACollector()
    collector.get_current_player_names()

main()	

