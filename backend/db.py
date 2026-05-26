from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = "MONGO_URI"
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["dayzero"]

users_collection = db["users"]
recruiters_collection = db["recruiters"]