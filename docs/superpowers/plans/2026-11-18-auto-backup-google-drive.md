# Automated Google Drive Backup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automated daily backups of the SQLite database (`muhasebe.db`) to Google Drive (`ubuntuserverclaude@gmail.com`) using a cron job, without breaking the existing production system.

**Architecture:** A standalone Node.js script (`scripts/backup-to-drive.js`) that uses Google Drive API with service account or OAuth credentials. The script runs via systemd timer (cron) daily at 02:00. It creates a compressed backup, uploads to a designated Drive folder, and rotates old backups (keep last 30 days). Existing manual backup endpoint remains untouched.

**Tech Stack:** Node.js, `googleapis` library, `better-sqlite3` for consistent backup, `systemd` timer for scheduling.

**Spec:** User wants automated backup to existing Google Drive account, preserving current manual backup button functionality.

## Global Constraints

- **DO NOT MODIFY** existing `server.ts`, `db.ts`, or any production API endpoints.
- Backup script must be **standalone** and runnable independently.
- Use existing Google Drive credentials (service account key or OAuth tokens) stored securely in `/home/serkan/.config/gdrive/`.
- Keep last 30 daily backups in Drive folder `MuhasebeCepte_Backups`.
- Log all operations to `/home/serkan/logs/backup.log` with rotation.
- Production database at `/home/serkan/muhasebe-cepte/data/muhasebe.db` must remain online during backup (use SQLite `.backup` API).

## Review Focus

1. **Zero Downtime:** Backup must not lock the database or interrupt the running API server.
2. **Credential Security:** Service account key file permissions 600, not committed to git.
3. **Idempotency:** Re-running script same day should not create duplicates.
4. **Verification:** Script must verify upload success and log file size/checksum.
5. **Rotation:** Old backups (>30 days) automatically deleted from Drive.

---

### Task 1: Prepare Google Drive Credentials & Folder Structure

**Files:**
- Create: `/home/serkan/.config/gdrive/credentials.json` (service account key)
- Create: `/home/serkan/scripts/backup-to-drive.js`
- Create: `/home/serkan/logs/` directory

**Interfaces:**
- Consumes: Google Drive API credentials, SQLite database file.
- Produces: Compressed `.db.gz` backup file uploaded to Drive.

- [ ] **Step 1: Create credentials directory and verify service account access**
- [ ] **Step 2: Create Drive folder "MuhasebeCepte_Backups" if not exists (via script)**
- [ ] **Step 3: Test Drive API connection with a small test file**

### Task 2: Implement Backup Script (`backup-to-drive.js`)

**Files:**
- Create: `/home/serkan/scripts/backup-to-drive.js`

**Interfaces:**
- Consumes: `better-sqlite3` for `.backup()`, `zlib` for gzip, `googleapis` for Drive v3.
- Produces: Uploaded backup file metadata, local log entry.

- [ ] **Step 1: Implement SQLite online backup using `db.backup()` to temp file**
- [ ] **Step 2: Compress temp file with gzip**
- [ ] **Step 3: Authenticate with Google Drive API (service account)**
- [ ] **Step 4: Find/create "MuhasebeCepte_Backups" folder in Drive**
- [ ] **Step 5: Upload compressed file with naming `muhasebe_YYYY-MM-DD_HH-MM.db.gz`**
- [ ] **Step 6: Implement rotation: delete files older than 30 days in that folder**
- [ ] **Step 7: Structured logging to `/home/serkan/logs/backup.log` (JSON lines)**
- [ ] **Step 8: Error handling with retry logic (3 retries, exponential backoff)**

### Task 3: Systemd Timer Setup (Daily at 02:00)

**Files:**
- Create: `/etc/systemd/system/muhasebe-backup.service`
- Create: `/etc/systemd/system/muhasebe-backup.timer`

**Interfaces:**
- Consumes: Node.js binary path, script path, environment variables.
- Produces: Scheduled daily execution.

- [ ] **Step 1: Create systemd service unit (Type=oneshot, User=serkan)**
- [ ] **Step 2: Create systemd timer unit (OnCalendar=*-*-* 02:00:00, Persistent=true)**
- [ ] **Step 3: Enable and start timer**
- [ ] **Step 4: Test with `systemctl start muhasebe-backup.service`**

### Task 4: Verification & Documentation

**Files:**
- Modify: `/home/serkan/README.md` (add backup section)

**Interfaces:**
- Consumes: Implemented backup system.
- Produces: Verified working backup, documentation.

- [ ] **Step 1: Run manual backup and verify file appears in Drive**
- [ ] **Step 2: Verify rotation works (simulate old file cleanup)**
- [ ] **Step 3: Check logs are written correctly**
- [ ] **Step 4: Document restore procedure in README**