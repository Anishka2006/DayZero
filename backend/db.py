from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
print("MONGO_URI:", MONGO_URI)

if "mongodb+srv" in MONGO_URI:
    import certifi
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where()
    )
else:
    client = MongoClient(MONGO_URI)

db = client["dayzero"]

users_collection = db["users"]
recruiters_collection = db["recruiters"]