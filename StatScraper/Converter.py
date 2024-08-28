import os
import csv
import json

# Function to convert csv to json
def convert_csv_to_json(csv_file_path, json_file_path):
    data = []
    with open(csv_file_path, mode='r') as csv_file:
        csv_reader = csv.reader(csv_file)
        
        # Manually define column names
        headers = [
            "Team", "Match Up", "Date", "Result", "Minutes", "Points", "FGM", "FGA", "FG%", "3PM", "3PA", "3P%", "FTM", "FTA", "FT%", 
            "OREB", "DREB", "REB", "AST", "STL", "BLK", "TOV", "PF", "+/-", "FP"
        ]
        
        for row in csv_reader:
            if row:  # Avoid adding empty rows
                data.append(dict(zip(headers, row)))

    with open(json_file_path, mode='w') as json_file:
        json.dump(data, json_file, indent=4)

# Function to convert all csvs to jsons in the player directory
def convert_all_csvs_to_json(root_dir):
    for player_dir in os.listdir(root_dir):
        player_path = os.path.join(root_dir, player_dir)
        if os.path.isdir(player_path):
            for csv_file in os.listdir(player_path):
                if csv_file.endswith('.csv'):
                    csv_file_path = os.path.join(player_path, csv_file)
                    json_file_name = csv_file.replace('.csv', '.json')
                    json_file_path = os.path.join(player_path, json_file_name)
                    
                    convert_csv_to_json(csv_file_path, json_file_path)
                    print(f"Converted {csv_file_path} to {json_file_path}")

# Define the root directory
root_directory = 'NBA_Stats'

# Call the function to convert all CSVs to JSON
convert_all_csvs_to_json(root_directory)
