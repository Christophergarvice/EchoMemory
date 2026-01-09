import json
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import datetime

class Proc:
    def __init__(self, log, out):
        self.log = Path(log)
        self.out = Path(out)
        self.convos = defaultdict(list)
    
    def parse(self):
        for line in open(self.log):
            try:
                d = json.loads(line)
                if 'role' in d and 'content' in d:
                    date = datetime.fromisoformat(d.get('ts','').replace('Z','')).strftime('%Y-%m-%d')
                    self.convos[date].append(d)
            except:
                pass
    
    def write(self):
        self.out.mkdir(exist_ok=True)
        for date, msgs in self.convos.items():
            md = '\n'.join([f"## {m['role'].upper()}\n{m['content']}\n" for m in msgs])
            (self.out / f"{date}.md").write_text(md)
        print(f"✓ {len(self.convos)} files written")

parser = argparse.ArgumentParser()
parser.add_argument('--log-file', required=True)
parser.add_argument('--output-dir', required=True)
args = parser.parse_args()

proc = Proc(args.log_file, args.output_dir)
proc.parse()
proc.write()
EOF

