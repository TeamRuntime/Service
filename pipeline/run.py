# pipeline/run.py

from preprocess import run as preprocess
from calculate  import run as calculate
from classify   import run as classify
from export     import run as export
from transfer   import export_transfer_excel 

df = preprocess("../data/raw/participants.csv")
df = calculate(df)
df = classify(df, use_ai=True)
export(df, "../data/output/result.json")
export_transfer_excel(                         
    df,
    output_path="../data/output/transfer",
    template_path="../data/templates/bank_transfer.xlsx"  # 없으면 None
)