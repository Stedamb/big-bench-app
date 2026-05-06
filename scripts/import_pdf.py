import pdfplumber
import pandas as pd
import os

pdf_path = os.path.join(os.path.dirname(__file__), "passaporti.pdf")
output_path = os.path.join(os.path.dirname(__file__), "passaporti_output.csv")

all_rows = []

with pdfplumber.open(pdf_path) as pdf:
    for page_num, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if not row or all(cell is None or cell == "" for cell in row):
                    continue
                all_rows.append(row)

df = pd.DataFrame(all_rows)
header = df.iloc[0].tolist()
df = df[1:]
df.columns = [header[i] if pd.notna(header[i]) and header[i] != "" else f"col_{i}" for i in range(len(header))]
df = df.loc[:, ~df.columns.str.startswith("col_")]
df.to_csv(output_path, index=False)
print(f"Saved {len(df)} rows to {output_path}")
