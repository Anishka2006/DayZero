from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

print("MONGO_URI:", MONGO_URI)

if not MONGO_URI:
    raise Exception("MONGO_URI environment variable not found")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client["dayzero"]

users_collection = db["users"]
recruiters_collection = db["recruiters"]
invited_candidates_collection = db["invited_candidates"]
invites_collection = db["invites"]
projects_collection = db["projects"]