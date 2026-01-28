# ✅ Delete Report Feature - Director Only

## Summary

Added the ability for **Directors ONLY** to delete reports (both draft and finalized) from the system.

---

## Features

### **1. Backend**:
- ✅ Delete endpoint: `DELETE /api/reports/:id`
- ✅ Restricted to Directors only
- ✅ Deletes report from database
- ✅ Creates audit log entry
- ✅ Returns success message

### **2. Frontend**:
- ✅ Delete button (trash icon) on each report card
- ✅ Only visible to Directors
- ✅ Appears on hover (smooth fade-in)
- ✅ Confirmation dialog before deletion
- ✅ Auto-refreshes list after deletion
- ✅ Success/error toast notifications

---

## How It Works

### **Backend Flow**:

```
Director clicks Delete
    ↓
DELETE /api/reports/:id
    ↓
Middleware checks: Is user Director? ✓
    ↓
Find report by ID
    ↓
Store caseId and status for audit log
    ↓
Delete report from database
    ↓
Create audit log entry
    ↓
Return success message
```

### **Frontend Flow**:

```
Director hovers over report card
    ↓
Delete button fades in (red trash icon)
    ↓
Director clicks delete button
    ↓
Confirmation dialog appears
    ↓
"Are you sure you want to delete report CASE-123?
 This action cannot be undone."
    ↓
Director clicks OK
    ↓
API call to DELETE /api/reports/:id
    ↓
Success toast: "Report CASE-123 deleted successfully"
    ↓
Reports list auto-refreshes
    ↓
Deleted report no longer shown
```

---

## User Experience

### **For Directors**:

1. Navigate to **Reports** page
2. **Hover** over any report card
3. **Red trash icon** appears in top-right
4. **Click** delete button
5. **Confirmation dialog** appears
6. **Confirm deletion**
7. **Success message** shown
8. **List refreshes** automatically

---

### **Visual Design**:

```
┌─────────────────────────────────────┐
│ CASE-123        [DRAFT] [🗑️]        │ ← Delete button appears on hover
│                                     │
│ John Doe                            │
│ ID: 123456                          │
│                                     │
│ 01/28/2026                    │
└─────────────────────────────────────┘
```

**Delete Button**:
- 🎨 Red background (`bg-red-600`)
- 🖱️ Darker on hover (`hover:bg-red-700`)
- 👁️ Hidden by default (`opacity-0`)
- ✨ Fades in on card hover (`group-hover:opacity-100`)
- 🗑️ Trash icon

---

## Security

### **Access Control**:
- ✅ **Backend**: `requireRole('director')` middleware
- ✅ **Frontend**: `{user.role === 'director' && ...}` conditional
- ✅ Only Directors can see and use delete button
- ✅ Technicians and Police cannot delete

### **Confirmation**:
- ✅ Browser confirmation dialog
- ✅ Shows case ID
- ✅ Warning: "This action cannot be undone"
- ✅ User must explicitly confirm

### **Audit Trail**:
- ✅ Every deletion logged
- ✅ Records: User, role, timestamp, case ID, status
- ✅ Details: "Deleted report CASE-123 (status: draft)"
- ✅ Visible in Audit Logs (Directors only)

---

## Code Changes

### **Backend**:

**1. `backend/controllers/reportController.js`**:
```javascript
exports.deleteReport = async (req, res) => {
    const { id } = req.params;
    const report = await Report.findById(id);
    
    if (!report) {
        return res.status(404).json({ message: 'Report not found' });
    }

    const caseId = report.caseId;
    const status = report.status;

    // Delete the report
    await Report.findByIdAndDelete(id);

    // Create audit log
    await AuditLog.create({
        action: 'delete',
        resource: status === 'finalized' ? 'final_report' : 'draft_results',
        userId: req.userId,
        userRole: req.userRole,
        resourceId: id,
        details: `Deleted report ${caseId} (status: ${status})`,
        ipAddress: req.ip
    });

    res.json({ success: true, message: `Report ${caseId} deleted successfully` });
};
```

**2. `backend/routes/reportRoutes.js`**:
```javascript
// Delete report - Directors only
router.delete(
    '/:id',
    requireRole('director'),
    reportController.deleteReport
);
```

---

### **Frontend**:

**`frontend/src/pages/Reports.jsx`**:

**1. Import trash icon**:
```javascript
import { FaFileAlt, FaCheckCircle, FaTrash } from 'react-icons/fa';
```

**2. Handle delete function**:
```javascript
const handleDelete = async (e, reportId, caseId) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop event bubbling

    const confirmed = window.confirm(
        `Are you sure you want to delete report ${caseId}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
        await api.delete(`/reports/${reportId}`);
        toast.success(`Report ${caseId} deleted successfully`);
        fetchReports(); // Refresh list
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete report');
    }
};
```

**3. Delete button in report card**:
```javascript
{user.role === 'director' && (
    <button
        onClick={(e) => handleDelete(e, report._id, report.caseId)}
        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white 
                   transition-all opacity-0 group-hover:opacity-100"
        title="Delete Report"
    >
        <FaTrash className="text-sm" />
    </button>
)}
```

---

## Testing Guide

### **1. Login as Director**:

```
Username: director1
Password: password123
```

### **2. Navigate to Reports**:

Go to: `http://localhost:3000/reports`

### **3. Hover Over Report Card**:

- Move mouse over any report
- **Red trash icon** should appear in top-right

### **4. Click Delete Button**:

- Click the trash icon
- **Confirmation dialog** appears

### **5. Confirm Deletion**:

```
Are you sure you want to delete report CASE-123?

This action cannot be undone.

[Cancel] [OK]
```

- Click **OK**

### **6. Verify**:

- ✅ Success toast: "Report CASE-123 deleted successfully"
- ✅ Report removed from list
- ✅ List auto-refreshes

### **7. Check Audit Logs**:

- Go to: `http://localhost:3000/audit`
- Look for: "Deleted report CASE-123 (status: draft)"
- Verify timestamp and user

---

### **Test as Non-Director**:

**Login as Technician**:
```
Username: technician1
Password: password123
```

**Go to Reports**: `http://localhost:3000/reports`

**Verify**:
- ❌ No delete button visible (even on hover)
- ✅ Can still view reports
- ✅ Can still create reports

---

## Error Handling

### **Report Not Found**:
```
Error: Report not found
```

### **Not Authorized**:
```
Error: Access denied. You are not authorized.
(If non-director tries to access endpoint directly)
```

### **Network Error**:
```
Error: Failed to delete report
```

---

## Confirmation Dialog Text

```
Are you sure you want to delete report CASE-123?

This action cannot be undone.
```

**Features**:
- Shows specific case ID
- Clear warning about permanence
- Two-step process (click delete, then confirm)

---

## Audit Log Entry

**Example**:
```json
{
  "action": "delete",
  "resource": "draft_results",
  "userId": "65abc123def...",
  "userRole": "director",
  "resourceId": "65xyz789abc...",
  "details": "Deleted report CASE-123 (status: draft)",
  "ipAddress": "::1",
  "timestamp": "2026-01-28T18:35:00.000Z"
}
```

---

## Files Modified

1. **`backend/controllers/reportController.js`** - Added `deleteReport` function
2. **`backend/routes/reportRoutes.js`** - Added DELETE route
3. **`frontend/src/pages/Reports.jsx`** - Added delete button and handler

---

## For Your Viva

**Examiner**: "Can technicians delete reports?"

**Your Answer**:
"No. The delete functionality is restricted to Directors only, enforced at multiple levels:

1. **Backend Authorization**: The DELETE route uses the `requireRole('director')` middleware, which returns 403 Forbidden if a non-director attempts to access it.

2. **Frontend UI**: The delete button is conditionally rendered only when `user.role === 'director'`, so technicians and police don't even see the button.

3. **Audit Trail**: Every deletion is logged with the director's user ID, timestamp, and details about which report was deleted.

This implements the principle of least privilege and separation of duties. Directors have full administrative control, while technicians can only create and modify drafts. This prevents accidental or unauthorized deletion of forensic evidence."

---

**Examiner**: "What happens if someone tries to delete a report that doesn't exist?"

**Your Answer**:
"The system handles this gracefully:

1. **Backend Check**: We first query the database for the report by ID
2. **Not Found**: If the report doesn't exist, we return a 404 error with the message 'Report not found'
3. **Frontend**: The error is caught and displayed to the user via a toast notification
4. **No Crash**: The application continues to function normally

This defensive programming ensures the system remains stable even with invalid requests."

---

## Summary

✅ **Directors can delete reports**  
✅ **Beautiful hover-to-reveal delete button**  
✅ **Confirmation dialog prevents accidents**  
✅ **Auto-refresh after deletion**  
✅ **Complete audit trail**  
✅ **Restricted to Directors only**  
✅ **Works for both draft and finalized reports**  

**Ready to test!** 🚀
