import pandas as pd

input_file = "datasets/raw/rows.csv"
output_file = "datasets/cleaned/landslides_clean.csv"

df = pd.read_csv(input_file)

columns = [
    "event_id",
    "event_date",
    "event_title",
    "event_description",
    "location_description",
    "landslide_category",
    "landslide_trigger",
    "landslide_size",
    "landslide_setting",
    "fatality_count",
    "injury_count",
    "country_name",
    "admin_division_name",
    "longitude",
    "latitude"
]

df = df[columns]

df.to_csv(output_file, index=False)

print("Cleaned dataset created successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))