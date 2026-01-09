#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "daily_log"

def utc_today():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def parse_jsonl(path):
    entries = []
    if not path.exists():
        return entries
    for line in path.read_text(encoding="utf-8").strip().split("\n"):
        if line.strip():
            try:
                entries.append(json.loads(line))
            except:
                pass
    return entries

def format_transcript(entries):
    lines = []
    for e in entries:
        role = e.get("role", "unknown").upper()
        content = e.get("content", "").strip()
        ts = e.get("ts", "")[11:19]
        source = e.get("source", "")
        lines.append(f"[{ts}] [{source}] {role}:")
        lines.append(content)
        lines.append("")
    return "\n".join(lines)

def build_memory(date_str=None):
    if date_str is None:
        date_str = utc_today()
    
    log_path = LOG_DIR / f"log_{date_str}.jsonl"
    mem_path = LOG_DIR / f"memory_{date_str}.txt"
    
    if not log_path.exists():
        print(f"[WARN] No log: {log_path.name}")
        return None
    
    entries = parse_jsonl(log_path)
    if not entries:
        print(f"[WARN] Empty: {log_path.name}")
        return None
    
    print(f"[INFO] Building from {log_path.name} ({len(entries)} entries)")
    
    header = f"# Conversation Log - {date_str}\n"
    header += f"# Entries: {len(entries)}\n"
    header += "=" * 50 + "\n\n"
    
    mem_path.write_text(header + format_transcript(entries), encoding="utf-8")
    print(f"[OK] Created {mem_path.name}")
    return mem_path

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        build_memory(sys.argv[1])
    else:
        build_memory()
