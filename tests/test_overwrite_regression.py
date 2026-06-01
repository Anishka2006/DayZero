import os
import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock
from bson import ObjectId

# Ensure backend package can be imported
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Set dummy MONGO_URI to bypass backend/db.py validation
os.environ["MONGO_URI"] = "mongodb://localhost:27017/"

# Import backend.app
import backend.app as backend_app

class TestOverwriteRegression(unittest.TestCase):
    def setUp(self):
        # Backup the original collections
        self.orig_invited_candidates = backend_app.invited_candidates_collection
        self.orig_invites = backend_app.invites_collection
        self.orig_projects = backend_app.projects_collection

        # Create mocks
        backend_app.invited_candidates_collection = MagicMock()
        backend_app.invites_collection = MagicMock()
        backend_app.projects_collection = MagicMock()

        self.test_email = "regression-test@example.com"

    def tearDown(self):
        # Restore original collections
        backend_app.invited_candidates_collection = self.orig_invited_candidates
        backend_app.invites_collection = self.orig_invites
        backend_app.projects_collection = self.orig_projects

    def test_get_valid_invite_status(self):
        # Test 1: In-progress/active/accepted/completed/invited/none statuses are valid
        for status in ["active", "accepted", "in-progress", "completed", "invited"]:
            mock_invite = {
                "email": self.test_email,
                "status": status,
                "projectId": "test-project",
                "role": "Frontend Engineer"
            }
            backend_app.invited_candidates_collection.find_one.return_value = mock_invite
            backend_app.invites_collection.find_one.return_value = None

            invite = backend_app._get_valid_invite(self.test_email)
            self.assertIsNotNone(invite, f"Invite with status '{status}' should be valid")
            self.assertEqual(invite["email"], self.test_email)

        # Test 2: Revoked, cancelled, expired statuses are invalid
        for status in ["revoked", "cancelled", "expired"]:
            mock_invite = {
                "email": self.test_email,
                "status": status,
                "projectId": "test-project",
                "role": "Frontend Engineer"
            }
            backend_app.invited_candidates_collection.find_one.return_value = mock_invite
            backend_app.invites_collection.find_one.return_value = None

            invite = backend_app._get_valid_invite(self.test_email)
            self.assertIsNone(invite, f"Invite with status '{status}' should be invalid")

    def test_project_id_lookups_and_precedence(self):
        str_pid = "str-project-id"
        int_pid = 999999
        obj_pid = ObjectId()

        # Mock projects database behavior
        mock_projects = {
            str_pid: {
                "_id": str_pid,
                "id": str_pid,
                "title": "String Project",
                "companyId": "str-corp",
                "description": "String project description"
            },
            int_pid: {
                "_id": int_pid,
                "id": int_pid,
                "title": "Integer Project",
                "companyId": "int-corp",
                "description": "Integer project description"
            },
            str(obj_pid): {
                "_id": obj_pid,
                "id": str(obj_pid),
                "title": "ObjectId Project",
                "companyId": "obj-corp",
                "description": "ObjectId project description"
            }
        }

        # Setup dynamic mock query for projects
        def mock_find_one(query):
            val = query.get("id") or query.get("_id")
            if val is not None:
                if isinstance(val, ObjectId):
                    return mock_projects.get(str(val))
                if val in mock_projects:
                    return mock_projects[val]
                if str(val) in mock_projects:
                    return mock_projects[str(val)]
            return None

        backend_app.projects_collection.find_one.side_effect = mock_find_one
        backend_app.invited_candidates_collection.find_one.return_value = None
        backend_app.invites_collection.find_one.return_value = None

        with backend_app.app.test_request_context():
            # Test A: String ID resolution
            payload = {"projectId": str_pid}
            task_id, role, name, context = backend_app._resolve_db_driven_simulation_args(payload)
            self.assertEqual(context.get("title"), "String Project")
            self.assertEqual(context.get("company"), "str-corp")

            # Test B: Integer ID resolution
            payload = {"projectId": str(int_pid)} # Pass as string representation
            task_id, role, name, context = backend_app._resolve_db_driven_simulation_args(payload)
            self.assertEqual(context.get("title"), "Integer Project")
            self.assertEqual(context.get("company"), "int-corp")

            # Test C: ObjectId ID resolution
            payload = {"projectId": str(obj_pid)} # Pass as hex string
            task_id, role, name, context = backend_app._resolve_db_driven_simulation_args(payload)
            self.assertEqual(context.get("title"), "ObjectId Project")
            self.assertEqual(context.get("company"), "obj-corp")

            # Test D: Precedence (Recruiter/DB context overrides payload values)
            backend_app.projects_collection.find_one.side_effect = lambda query: mock_projects.get(str_pid)
            payload = {
                "projectId": str_pid,
                "task_context": {
                    "title": "Stale Payload Title",
                    "company": "stale-corp",
                    "description": "Stale payload description"
                }
            }
            task_id, role, name, context = backend_app._resolve_db_driven_simulation_args(payload)
            self.assertEqual(context.get("title"), "String Project", "DB title should override payload title")
            self.assertEqual(context.get("company"), "str-corp", "DB company should override payload company")
            self.assertEqual(context.get("description"), "String project description", "DB description should override payload description")

if __name__ == "__main__":
    unittest.main()
