import os
import sys
from pymongo import MongoClient
import uuid
from dotenv import load_dotenv

load_dotenv()

def test_invitation_db_flow():
    print("=== Testing Recruiter Invitation DB Flow ===")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    if "mongodb+srv" in MONGO_URI:
        import certifi
        client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
    else:
        client = MongoClient(MONGO_URI)
    db = client["dayzero"]
    
    # Check collections
    collections = db.list_collection_names()
    print(f"Active database collections: {collections}")
    
    # 1. Setup Test Document
    invited_candidates = db["invited_candidates"]
    test_email = f"test-candidate-{uuid.uuid4().hex[:6]}@example.com"
    invite_data = {
        "_id": str(uuid.uuid4()),
        "email": test_email,
        "name": "Automation Test Candidate",
        "companyId": "test-corp",
        "companyName": "Test Corporation",
        "recruiterId": "recruiter@test-corp.com",
        "token": uuid.uuid4().hex,
        "status": "active",
        "projectId": "frontend-homeflow",
        "projectTitle": "Checkout Flow Improvements",
        "role": "Frontend Engineer",
        "experienceLevel": "Beginner",
        "message": "Welcome to the corporate hiring simulation run!"
    }
    
    # 2. Insert Invitation
    print(f"Inserting mock invitation for: {test_email}")
    res = invited_candidates.insert_one(invite_data)
    assert res.inserted_id == invite_data["_id"], "Insertion ID mismatch!"
    print("✔ Mock invitation successfully inserted in MongoDB!")
    
    # 3. Query/Validate Invitation
    print("Querying the inserted invitation...")
    record = invited_candidates.find_one({"email": test_email, "status": "active"})
    assert record is not None, "Failed to retrieve the inserted active invitation!"
    assert record["companyId"] == "test-corp", "Company ID mismatch!"
    print("✔ Active invitation successfully verified via Mongo query!")
    
    # 4. Clean Up Test Data
    print("Cleaning up mock test invitation...")
    del_res = invited_candidates.delete_one({"email": test_email})
    assert del_res.deleted_count == 1, "Failed to clean up test invite document!"
    print("✔ Database successfully cleaned up and test invitation removed!")
    print("=== DB Flow Test Passed Successfully! ===\n")

if __name__ == "__main__":
    try:
        test_invitation_db_flow()
        sys.exit(0)
    except Exception as e:
        print(f"❌ DB Flow Test Failed: {e}", file=sys.stderr)
        sys.exit(1)
