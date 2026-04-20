# Field Agent RBAC Restrictions (Approved Plan)

**Goal:** Field agents view/update ONLY their assigned fields in dashboard/fields section. Block other data/views.

## Steps (0/5 complete):

### 1. ✅ Create this TODO.md
### 2. ✅ Edit FieldForm.jsx - Convert to agent-safe view (read-only except stage/notes; hide admin fields)
### 3. ✅ Tweak FieldList.jsx - Ensure no admin leaks; "No fields" → contact admin
### 4. ✅ Update routes.js - Add roles: ['admin','agent'] to /fields for explicit guard
### 5. ✅ Polish UserManagement/Dashboard - Confirm guards; update TODO.md as complete
### 6. Test: Agent login → only assigned fields editable (stage/notes), others blocked/read-only
### 7. Complete task with attempt_completion

**Status:** Backend secure. Frontend mostly ready (nav hides /users). FieldForm main gap.

