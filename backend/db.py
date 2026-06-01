from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "dayzero")

if not MONGO_URI:
    raise Exception("MONGO_URI environment variable not found")

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        options: dict[str, Any] = {
            "serverSelectionTimeoutMS": int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "6000")),
            "connectTimeoutMS": int(os.getenv("MONGO_CONNECT_TIMEOUT_MS", "4000")),
            "socketTimeoutMS": int(os.getenv("MONGO_SOCKET_TIMEOUT_MS", "10000")),
        }
        if "mongodb+srv" in MONGO_URI:
            options.update({"tls": True, "tlsCAFile": certifi.where()})
        _client = MongoClient(MONGO_URI, **options)
    return _client


class MongoDatabaseProxy:
    def _database(self):
        return get_client()[MONGO_DB_NAME]

    def __getitem__(self, collection_name: str):
        return MongoCollectionProxy(collection_name)

    def __getattr__(self, attr: str):
        return getattr(self._database(), attr)


class MongoCollectionProxy:
    def __init__(self, collection_name: str) -> None:
        self._collection_name = collection_name

    def _collection(self):
        return get_client()[MONGO_DB_NAME][self._collection_name]

    def __getattr__(self, attr: str):
        return getattr(self._collection(), attr)

    def __repr__(self) -> str:
        return f"<MongoCollectionProxy {MONGO_DB_NAME}.{self._collection_name}>"


db = MongoDatabaseProxy()
client = db

users_collection = db["users"]
recruiters_collection = db["recruiters"]
invited_candidates_collection = db["invited_candidates"]
invites_collection = db["invites"]
projects_collection = db["projects"]
candidates_collection = db["candidates"]

