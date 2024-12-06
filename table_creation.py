# table_creation.py

import pandas as pd

def create_table(file_path):
    # Load Data File
    dataframe = pd.read_csv(file_path)

    # Print Data Frame
    print('Dataframe:\n')
    print(dataframe)
